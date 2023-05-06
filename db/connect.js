const mongoose = require('mongoose');

const connectDB = (url) => {
  // Remove those deprecation warning
  mongoose.set('strictQuery', true);
  return mongoose.connect(url);
};

module.exports = connectDB;
