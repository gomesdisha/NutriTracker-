import express from "express";
import { listAlerts, acknowledgeAlert, resolveAlert } from "../controllers/alert.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("SUPERVISOR", "ADMIN", "WORKER"), listAlerts);
router.patch("/:id/ack", requireAuth, requireRole("SUPERVISOR", "ADMIN"), acknowledgeAlert);
router.patch("/:id/resolve", requireAuth, requireRole("SUPERVISOR", "ADMIN"), resolveAlert);

export default router;

