const mongoose = require('mongoose');

const connectDB = async (url) => {
  const conn = await mongoose.connect(url);
  console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
};

module.exports = connectDB;