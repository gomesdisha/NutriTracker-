import express from "express";
import { z } from "zod";
import { createCenter, listCenters, updateCenter } from "../controllers/center.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const centerSchema = z.object({
  name: z.string().min(2).max(180),
  code: z.string().min(2).max(20),
  address: z.string().max(500).optional().default(""),
  district: z.string().max(120).optional().default(""),
  taluka: z.string().max(120).optional().default(""),
  pincode: z.string().max(10).optional().default(""),
  isActive: z.boolean().optional()
});

const updateCenterSchema = centerSchema.partial();

router.post("/", requireAuth, requireRole("ADMIN"), validateBody(centerSchema), createCenter);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERVISOR", "WORKER"), listCenters);
router.patch("/:id", requireAuth, requireRole("ADMIN"), validateBody(updateCenterSchema), updateCenter);

export default router;

