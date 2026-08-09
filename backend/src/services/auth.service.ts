import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { env } from '../utils/env';
import type { Role } from '../types';

const SALT_ROUNDS = 12;

export const registerUser = async (
  email: string,
  username: string,
  password: string,
  role: Role
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('El email ya está registrado');
    }
    throw new Error('El nombre de usuario ya está en uso');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: role.toUpperCase() as Role
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true
    }
  });

  await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 0
    }
  });

  const tokens = generateTokens(user.id, user.email, user.role);

  return { user, tokens };
};

export const findOrCreateGoogleUser = async (profile: any) => {
  const email = profile.emails?.[0]?.value;
  const googleId = profile.id;
  const displayName = profile.displayName;
  const avatar = profile.photos?.[0]?.value;

  if (!email) {
    throw new Error('No email provided by Google');
  }

  // Buscar usuario existente por email o googleId
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { googleId }],
    },
  });

  if (user) {
    // Actualizar googleId y avatar si no los tiene
    if (!user.googleId || !user.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          ...(avatar && !user.avatar && { avatar }),
        },
      });
    }
    return user;
  }

  // Crear nuevo usuario
  const baseUsername = displayName?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'user';
  let username = baseUsername;
  let counter = 1;

  // Asegurar username único
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}_${counter}`;
    counter++;
  }

  user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: '', // No password for OAuth users
      role: 'FAN',
      googleId,
      avatar,
    },
  });

  // Crear wallet para el nuevo usuario
  await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 0,
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Credenciales inválidas');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  const tokens = generateTokens(user.id, user.email, user.role);

  return { user: userWithoutPassword, tokens };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          balance: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('La contraseña actual es incorrecta');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  return { message: 'Contraseña actualizada correctamente' };
};

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

const generateAccessToken = (userId: string, email: string, role: string): string => {
  const payload: JwtPayload = { id: userId, email, role, type: 'access' };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId: string, email: string, role: string): string => {
  const payload: JwtPayload = { id: userId, email, role, type: 'refresh' };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
};

export const generateTokens = (userId: string, email: string, role: string) => ({
  accessToken: generateAccessToken(userId, email, role),
  refreshToken: generateRefreshToken(userId, email, role)
});

export const refreshTokens = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error('Refresh token requerido');
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Refresh token inválido o expirado');
  }

  if (payload.type !== 'refresh') {
    throw new Error('Refresh token inválido');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return generateTokens(user.id, user.email, user.role);
};
