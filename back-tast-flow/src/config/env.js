// src/config/env.js
const path = require('path');
const dotenv = require('dotenv');

// Charger le fichier .env à la racine du projet
dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
});

const requiredEnv = ['PORT', 'MONGO_URI', 'JWT_SECRET'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Variable d'environnement manquante : ${key}`);
    process.exit(1);
  }
});

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

module.exports = config;
