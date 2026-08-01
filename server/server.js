import 'dotenv/config';
import app from './src/app.js';

const requiredEnvVars = ['JWT_SECRET'];
for (const key of requiredEnvVars) {
  const val = process.env[key];
  if (!val || val.startsWith('change_this') || val.startsWith('sk_test_...')) {
    console.error(`ERREUR: ${key} n'est pas configuré dans .env`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
});