import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./config/db.js";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT || 5000);

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment");
  }
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("Missing JWT_ACCESS_SECRET in environment");
  }

  await connectDb(process.env.MONGO_URI);

  const app = buildApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

