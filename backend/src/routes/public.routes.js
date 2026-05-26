import express from "express";
import Center from "../models/Center.js";

const router = express.Router();

// Public centers list for signup: only active centers, minimal fields
router.get("/centers", async (req, res) => {
  const centers = await Center.find({ isActive: true })
    .sort({ name: 1 })
    .select("name code")
    .lean();
  return res.json({ centers });
});

export default router;

