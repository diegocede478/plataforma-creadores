# ========================================
# Creata - Dockerfile multi-etapa (Railway)
# Un solo servicio: Express sirve el build de Vite
# ========================================

# ── Etapa 1: build del frontend ──
FROM node:22 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# La API vive en el mismo origen (/api) para evitar CORS en producción
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Etapa 2: build del backend ──
FROM node:22 AS backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate && npm run build

# ── Etapa 3: runtime ──
FROM node:22-slim AS runtime
WORKDIR /app
# openssl es requerido por el motor de consulta de Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=backend /app/backend/node_modules ./backend/node_modules
COPY --from=backend /app/backend/dist ./backend/dist
COPY --from=backend /app/backend/prisma ./backend/prisma
COPY --from=backend /app/backend/package.json ./backend/package.json
COPY --from=frontend /app/frontend/dist ./public

ENV NODE_ENV=production

# Aplica migraciones y levanta el servidor
CMD ["sh", "-c", "cd backend && ./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
