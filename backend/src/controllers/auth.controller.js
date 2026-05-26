import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Center from "../models/Center.js";

function signAccessToken(user) {
  return jwt.sign(
    { role: user.role, centerId: user.centerId || null },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: String(user._id),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "8h"
    }
  );
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user);

  return res.json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      centerId: user.centerId
    }
  });
}

/**
 * Public signup:
 * - Creates WORKER accounts only (Admin/Supervisor created by Admin)
 * - Requires selecting a valid centerId
 */
export async function signup(req, res) {
  const { name, email, password, centerId } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const center = await Center.findById(centerId).lean();
  if (!center || !center.isActive) return res.status(400).json({ message: "Invalid centerId" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "WORKER",
    centerId: center._id,
    isActive: true
  });

  const accessToken = signAccessToken(user);
  return res.status(201).json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      centerId: user.centerId
    }
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select("name email role centerId isActive").lean();
  if (!user || !user.isActive) return res.status(401).json({ message: "Unauthenticated" });
  return res.json({ user: { id: user._id, ...user } });
}

