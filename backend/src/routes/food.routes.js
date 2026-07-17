import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", requireAuth, async (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Search term is required" });

  try {
    const apiKey = process.env.CALORIE_API_KEY || "fn_Sg8ZhtUqVzMNh7ifq6HccqE3xcsPD2wQKnLir-MNbB0";
    console.log(`[Proxy] Fetching CalorieAPI for query: ${q}`);
    
    const response = await fetch(
      `https://calorieapiadmin.com/api/v1/search/foods?q=${encodeURIComponent(q.trim())}`,
      {
        headers: {
          "X-API-Key": apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CalorieAPI responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error("[Proxy Error] CalorieAPI failed:", err.message);
    return res.json({ data: [] });
  }
});

export default router;
