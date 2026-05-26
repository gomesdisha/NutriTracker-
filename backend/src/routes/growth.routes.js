import express from "express";
import { z } from "zod";
import { addGrowthEntry, listChildGrowth } from "../controllers/growth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const growthCreateSchema = z.object({
  childId: z.string(),
  measuredAt: z.coerce.date(),
  heightCm: z.number().min(30).max(130),
  weightKg: z.number().min(1).max(40)
});

router.post("/", requireAuth, requireRole("WORKER", "ADMIN"), validateBody(growthCreateSchema), addGrowthEntry);
router.get("/child/:childId", requireAuth, requireRole("WORKER", "SUPERVISOR", "ADMIN"), listChildGrowth);

export default router;

