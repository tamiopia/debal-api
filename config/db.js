const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    // console.log('🔗mongodeb:',process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
     
    });
    console.log(`🎊`+`🎊`+`🥇`+` your humble servent  MongoDB Connected as expected!`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;