import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import centerRoutes from "./routes/center.routes.js";
import childRoutes from "./routes/child.routes.js";
import growthRoutes from "./routes/growth.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import supervisorRoutes from "./routes/supervisor.routes.js";
import publicRoutes from "./routes/public.routes.js";
import foodRoutes from "./routes/food.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/public", publicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/centers", centerRoutes);
  app.use("/api/children", childRoutes);
  app.use("/api/growth", growthRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use("/api/supervisor", supervisorRoutes);
  app.use("/api/food", foodRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

