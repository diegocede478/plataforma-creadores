import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import serviceRoutes from './routes/service.routes';
import subscriptionRoutes from './routes/subscription.routes';
import orderRoutes from './routes/order.routes';
import messageRoutes from './routes/message.routes';
import walletRoutes from './routes/wallet.routes';
import { errorHandler } from './middlewares/errorHandler';

// Inicializar passport strategies
import './services/oauth.service';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Session para passport
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wallet', walletRoutes);

// ─────────────────────────────────────────────────────────────
// Frontend estático (producción)
// ─────────────────────────────────────────────────────────────
// En el contenedor, el build de Vite vive en ./public (ver Dockerfile).
// El guard `fs.existsSync` mantiene el modo dev intacto (no hay public/).
const publicDir = path.resolve(__dirname, '../../public');
const indexHtml = path.join(publicDir, 'index.html');

app.use(express.static(publicDir));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    next();
  }
});

// Error handling
app.use(errorHandler);

export default app;
