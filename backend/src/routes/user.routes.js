import express from "express";
import { z } from "zod";
import { createUser, listUsers, updateUser } from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum(["ADMIN", "WORKER", "SUPERVISOR"]),
  centerId: z.string().optional().nullable()
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(200).optional(),
  role: z.enum(["ADMIN", "WORKER", "SUPERVISOR"]).optional(),
  centerId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

router.post("/", requireAuth, requireRole("ADMIN"), validateBody(createUserSchema), createUser);
router.get("/", requireAuth, requireRole("ADMIN"), listUsers);
router.patch("/:id", requireAuth, requireRole("ADMIN"), validateBody(updateUserSchema), updateUser);

export default router;

