import app from './app';
import { env } from './utils/env';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${env.PORT}`);
  console.log(`📡 Ambiente: ${env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});
