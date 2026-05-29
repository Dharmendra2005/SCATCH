require("dotenv").config();
const mongoose = require("mongoose");
const db = require("../config/mongoose-connection");
const User = require("../models/user-model");

async function listUsers() {
  try {
    // wait for mongoose to connect
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        const check = () => {
          if (mongoose.connection.readyState === 1) return resolve();
          setTimeout(check, 100);
        };
        check();
        setTimeout(() => reject(new Error("connection timeout")), 5000);
      });
    }

    const users = await User.find().sort({ _id: -1 }).limit(50).lean();
    console.log("Latest users:", users);
    process.exit(0);
  } catch (err) {
    console.error("Error listing users:", err);
    process.exit(1);
  }
}

listUsers();
