import express from "express";
import { z } from "zod";
import { login, me, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  centerId: z.string().min(1)
});

router.post("/login", validateBody(loginSchema), login);
router.post("/signup", validateBody(signupSchema), signup);
router.get("/me", requireAuth, me);

export default router;

