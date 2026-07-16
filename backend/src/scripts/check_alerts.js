import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Alert from "../models/Alert.js";
import Child from "../models/Child.js";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const child = await Child.findOne({ name: "sheru" });
  console.log("Child:", child);
  if (child) {
    const alerts = await Alert.find({ childId: child._id });
    console.log("Alerts for sheru:", alerts);
  } else {
    console.log("sheru not found. All alerts:");
    const allAlerts = await Alert.find().populate("childId", "name");
    console.log(allAlerts);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
