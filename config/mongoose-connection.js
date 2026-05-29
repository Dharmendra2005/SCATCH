const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    await mongoose.connect(MONGODB_URI, { dbName: "DataBase" });
    isConnected = true;
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

connectDB();

module.exports = mongoose.connection;
