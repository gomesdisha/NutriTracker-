import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import Center from "../models/Center.js";
import User from "../models/User.js";

async function upsertCenter() {
  const code = "CTR001";
  const center =
    (await Center.findOne({ code })) ||
    (await Center.create({
      name: "Anganwadi Center 001",
      code,
      district: "Udupi",
      taluka: "Manipal",
      pincode: "576104",
      address: "Demo address"
    }));
  return center;
}

async function upsertUser({ name, email, role, centerId, password }) {
  const existing = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.centerId = centerId || null;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();
    return existing;
  }

  return await User.create({
    name,
    email,
    role,
    centerId: centerId || null,
    passwordHash
  });
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  if (!process.env.JWT_ACCESS_SECRET) throw new Error("Missing JWT_ACCESS_SECRET");

  await connectDb(process.env.MONGO_URI);

  const center = await upsertCenter();

  const admin = await upsertUser({
    name: "Admin",
    email: "admin@nutri.local",
    role: "ADMIN",
    centerId: null,
    password: "Admin@123"
  });

  const worker = await upsertUser({
    name: "Anganwadi Worker",
    email: "worker@nutri.local",
    role: "WORKER",
    centerId: center._id,
    password: "Worker@123"
  });

  const supervisor = await upsertUser({
    name: "Supervisor",
    email: "supervisor@nutri.local",
    role: "SUPERVISOR",
    centerId: null,
    password: "Supervisor@123"
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete.");
  // eslint-disable-next-line no-console
  console.log("Logins:");
  // eslint-disable-next-line no-console
  console.log(`ADMIN      email=admin@nutri.local      password=Admin@123      id=${admin._id}`);
  // eslint-disable-next-line no-console
  console.log(`WORKER     email=worker@nutri.local     password=Worker@123     center=${center.code}`);
  // eslint-disable-next-line no-console
  console.log(`SUPERVISOR email=supervisor@nutri.local password=Supervisor@123`);
  // eslint-disable-next-line no-console
  console.log(`Center: ${center.name} (${center.code}) id=${center._id}`);

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

