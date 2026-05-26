import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function createUser(req, res) {
  const { name, email, password, role, centerId } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    centerId: centerId || null
  });

  return res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      centerId: user.centerId,
      isActive: user.isActive
    }
  });
}

export async function listUsers(req, res) {
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .select("name email role centerId isActive createdAt lastLoginAt")
    .lean();
  return res.json({ users });
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const patch = { ...req.body };

  if (patch.email) patch.email = patch.email.toLowerCase().trim();
  if (patch.password) {
    patch.passwordHash = await bcrypt.hash(patch.password, 10);
    delete patch.password;
  }

  const user = await User.findByIdAndUpdate(id, patch, { new: true })
    .select("name email role centerId isActive createdAt lastLoginAt")
    .lean();

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user: { id: user._id, ...user } });
}

