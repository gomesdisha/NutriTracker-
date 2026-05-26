import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { summary } from "../controllers/supervisor.controller.js";

const router = express.Router();

router.get("/summary", requireAuth, requireRole("SUPERVISOR", "ADMIN"), summary);

export default router;

