// src/config/database.js
const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      // options possibles, mais pas obligatoires en local
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
