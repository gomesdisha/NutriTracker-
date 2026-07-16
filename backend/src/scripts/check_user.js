import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/User.js";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findById("69a6a555485a1f43c973ff95");
  console.log("User who resolved alert:", u);
  const allUsers = await User.find();
  console.log("All users in DB:", allUsers);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
