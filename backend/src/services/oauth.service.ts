import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../utils/prisma';
import { env } from '../utils/env';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user as any);
  } catch (error) {
    done(error, null);
  }
});

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: Function) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const displayName = profile.displayName;
          const avatar = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email provided by Google'), null);
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
            return done(null, user);
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

          return done(null, user);
        } catch (error) {
          return done(error as Error, null);
        }
      }
    )
  );
}

export const getGoogleAuthUrl = (): string | null => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
    return null;
  }
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export default passport;