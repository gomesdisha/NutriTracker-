import express from "express";
import { z } from "zod";
import { createChild, getChild, listChildren, updateChild } from "../controllers/child.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const childCreateSchema = z.object({
  name: z.string().min(2).max(140),
  dob: z.coerce.date(),
  gender: z.enum(["M", "F", "O"]),
  parent: z
    .object({
      fatherName: z.string().max(140).optional().default(""),
      motherName: z.string().max(140).optional().default(""),
      phone: z.string().max(20).optional().default(""),
      address: z.string().max(500).optional().default("")
    })
    .optional()
    .default({}),
  centerId: z.string()
});

const childUpdateSchema = z.object({
  name: z.string().min(2).max(140).optional(),
  dob: z.coerce.date().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  parent: z
    .object({
      fatherName: z.string().max(140).optional(),
      motherName: z.string().max(140).optional(),
      phone: z.string().max(20).optional(),
      address: z.string().max(500).optional()
    })
    .optional(),
  isActive: z.boolean().optional()
});

router.post("/", requireAuth, requireRole("WORKER", "ADMIN"), validateBody(childCreateSchema), createChild);
router.get("/", requireAuth, requireRole("WORKER", "SUPERVISOR", "ADMIN"), listChildren);
router.get("/:id", requireAuth, requireRole("WORKER", "SUPERVISOR", "ADMIN"), getChild);
router.patch("/:id", requireAuth, requireRole("WORKER", "ADMIN"), validateBody(childUpdateSchema), updateChild);

export default router;

