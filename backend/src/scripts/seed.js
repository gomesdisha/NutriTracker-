import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import Center from "../models/Center.js";
import User from "../models/User.js";
import Child from "../models/Child.js";
import GrowthEntry from "../models/GrowthEntry.js";
import Alert from "../models/Alert.js";
import { generateChildId } from "../utils/childId.js";
import { classifyGrowth } from "../utils/malnutrition.js";

async function upsertCenter(code, name, district, taluka, pincode, address) {
  const existing = await Center.findOne({ code });
  if (existing) {
    existing.name = name;
    existing.district = district;
    existing.taluka = taluka;
    existing.pincode = pincode;
    existing.address = address;
    existing.isActive = true;
    await existing.save();
    return existing;
  }
  return await Center.create({
    name,
    code,
    district,
    taluka,
    pincode,
    address,
    isActive: true
  });
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

async function addDemoGrowthEntry({ child, measuredAt, heightCm, weightKg, createdBy }) {
  const { status, reasons, ageMonths } = classifyGrowth({
    dob: child.dob,
    measuredAt,
    weightKg
  });

  const entry = await GrowthEntry.create({
    childId: child._id,
    centerId: child.centerId,
    measuredAt: new Date(measuredAt),
    heightCm,
    weightKg,
    ageMonths,
    status,
    reasons,
    createdBy
  });

  child.latestStatus = status;
  child.latestMeasuredAt = entry.measuredAt;
  await child.save();

  if (status === "SEVERE") {
    await Alert.updateOne(
      { childId: child._id, centerId: child.centerId, type: "SEVERE_MALNUTRITION", status: "OPEN" },
      {
        $set: {
          severity: "HIGH",
          message: `Severe malnutrition detected for ${child.name} (${child.childId}).`,
          growthEntryId: entry._id
        }
      },
      { upsert: true }
    );
  }

  // Check no improvement across last 3 entries
  const last3 = await GrowthEntry.find({ childId: child._id })
    .sort({ measuredAt: -1 })
    .limit(3)
    .lean();

  const last3Asc = [...last3].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  if (last3Asc.length === 3) {
    const [a, , c] = last3Asc;
    const rank = (s) => (s === "SEVERE" ? 0 : s === "MODERATE" ? 1 : 2);
    const statusNotImproving = rank(c.status) <= rank(a.status);
    const weightNotImproving = Number(c.weightKg) <= Number(a.weightKg);

    if (statusNotImproving && weightNotImproving) {
      await Alert.updateOne(
        { childId: child._id, centerId: child.centerId, type: "NO_IMPROVEMENT", status: "OPEN" },
        {
          $set: {
            severity: "MEDIUM",
            message: `No improvement across last 3 entries for ${child.name} (${child.childId}).`,
            growthEntryId: entry._id
          }
        },
        { upsert: true }
      );
    }
  }
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  if (!process.env.JWT_ACCESS_SECRET) throw new Error("Missing JWT_ACCESS_SECRET");

  await connectDb(process.env.MONGO_URI);

  // Clear existing demo children, growth entries, and alerts for a clean seed
  await Child.deleteMany({});
  await GrowthEntry.deleteMany({});
  await Alert.deleteMany({});

  const center1 = await upsertCenter(
    "CTR001",
    "Manipal Anganwadi Center",
    "Udupi",
    "Manipal",
    "576104",
    "Near KMC Hospital, Manipal"
  );

  const center2 = await upsertCenter(
    "CTR002",
    "Udupi Town Center",
    "Udupi",
    "Udupi",
    "576101",
    "Krishna Temple Road, Udupi"
  );

  const admin = await upsertUser({
    name: "Admin",
    email: "admin@nutri.local",
    role: "ADMIN",
    centerId: null,
    password: "Admin@123"
  });

  const worker1 = await upsertUser({
    name: "Aarti Devi (Worker 1)",
    email: "worker@nutri.local",
    role: "WORKER",
    centerId: center1._id,
    password: "Worker@123"
  });

  const worker2 = await upsertUser({
    name: "Sunita Rao (Worker 2)",
    email: "worker2@nutri.local",
    role: "WORKER",
    centerId: center2._id,
    password: "Worker@123"
  });

  const supervisor = await upsertUser({
    name: "Supervisor",
    email: "supervisor@nutri.local",
    role: "SUPERVISOR",
    centerId: null,
    password: "Supervisor@123"
  });

  // Seed Children
  const now = new Date();
  
  // Rohan Kumar (Normal growth)
  const dobRohan = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()); // 24 months old
  const rohan = await Child.create({
    name: "Rohan Kumar",
    childId: generateChildId(center1.code),
    dob: dobRohan,
    gender: "M",
    parent: { fatherName: "Rajesh Kumar", motherName: "Sita Kumar", phone: "9876543210", address: "Manipal Main Road" },
    centerId: center1._id,
    registeredBy: worker1._id
  });

  // Priya Sharma (Moderate malnutrition)
  const dobPriya = new Date(now.getFullYear(), now.getMonth() - 18, now.getDate()); // 18 months old
  const priya = await Child.create({
    name: "Priya Sharma",
    childId: generateChildId(center2.code),
    dob: dobPriya,
    gender: "F",
    parent: { fatherName: "Amit Sharma", motherName: "Meena Sharma", phone: "9988776655", address: "Krishna Temple Street" },
    centerId: center2._id,
    registeredBy: worker2._id
  });

  // Aarav Singh (Severe malnutrition & No improvement alerts)
  const dobAarav = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); // 12 months old
  const aarav = await Child.create({
    name: "Aarav Singh",
    childId: generateChildId(center1.code),
    dob: dobAarav,
    gender: "M",
    parent: { fatherName: "Vikram Singh", motherName: "Pooja Singh", phone: "9123456789", address: "Eshwar Nagar" },
    centerId: center1._id,
    registeredBy: worker1._id
  });

  // Seed Growth Entries
  
  // Rohan's Growth History (Normal, healthy growth)
  const rohanEntries = [
    { monthsAgo: 3, heightCm: 85, weightKg: 11.5 },
    { monthsAgo: 2, heightCm: 86, weightKg: 12.0 },
    { monthsAgo: 1, heightCm: 87, weightKg: 12.5 },
    { monthsAgo: 0, heightCm: 88, weightKg: 13.0 }
  ];
  for (const entry of rohanEntries) {
    const measuredAt = new Date(now.getFullYear(), now.getMonth() - entry.monthsAgo, now.getDate());
    await addDemoGrowthEntry({
      child: rohan,
      measuredAt,
      heightCm: entry.heightCm,
      weightKg: entry.weightKg,
      createdBy: worker1._id
    });
  }

  // Priya's Growth History (Moderate Malnutrition)
  const priyaEntries = [
    { monthsAgo: 2, heightCm: 76, weightKg: 8.0 },
    { monthsAgo: 1, heightCm: 77, weightKg: 8.2 },
    { monthsAgo: 0, heightCm: 78, weightKg: 8.3 } // moderately low weight for 18 months (~8.3kg is below 8.5kg moderate cutoff)
  ];
  for (const entry of priyaEntries) {
    const measuredAt = new Date(now.getFullYear(), now.getMonth() - entry.monthsAgo, now.getDate());
    await addDemoGrowthEntry({
      child: priya,
      measuredAt,
      heightCm: entry.heightCm,
      weightKg: entry.weightKg,
      createdBy: worker2._id
    });
  }

  // Aarav's Growth History (Malnourished, triggering SEVERE and NO_IMPROVEMENT)
  const aaravEntries = [
    { monthsAgo: 2, heightCm: 68, weightKg: 6.0 }, // 10 months old (moderate cutoff is ~6.2kg, severe is ~5.5kg -> MODERATE)
    { monthsAgo: 1, heightCm: 68, weightKg: 5.9 }, // 11 months old (moderate cutoff is ~6.8kg, severe is ~6.05kg -> SEVERE)
    { monthsAgo: 0, heightCm: 68, weightKg: 5.8 }  // 12 months old (moderate cutoff is ~7.4kg, severe is ~6.6kg -> SEVERE & NO_IMPROVEMENT)
  ];
  for (const entry of aaravEntries) {
    const measuredAt = new Date(now.getFullYear(), now.getMonth() - entry.monthsAgo, now.getDate());
    await addDemoGrowthEntry({
      child: aarav,
      measuredAt,
      heightCm: entry.heightCm,
      weightKg: entry.weightKg,
      createdBy: worker1._id
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete with rich demo children and growth entries.");
  // eslint-disable-next-line no-console
  console.log("Logins:");
  // eslint-disable-next-line no-console
  console.log(`ADMIN      email=admin@nutri.local      password=Admin@123      id=${admin._id}`);
  // eslint-disable-next-line no-console
  console.log(`WORKER 1   email=worker@nutri.local     password=Worker@123     center=${center1.code}`);
  // eslint-disable-next-line no-console
  console.log(`WORKER 2   email=worker2@nutri.local    password=Worker@123     center=${center2.code}`);
  // eslint-disable-next-line no-console
  console.log(`SUPERVISOR email=supervisor@nutri.local password=Supervisor@123`);
  // eslint-disable-next-line no-console
  console.log(`Center 1: ${center1.name} (${center1.code})`);
  // eslint-disable-next-line no-console
  console.log(`Center 2: ${center2.name} (${center2.code})`);

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


