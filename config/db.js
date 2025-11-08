// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in .env");
    }
    await mongoose.connect(uri);
    const { name, host } = mongoose.connection;
    console.log(`MongoDB connected → host: ${host}, db: ${name}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
