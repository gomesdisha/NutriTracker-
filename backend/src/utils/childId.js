import { customAlphabet } from "nanoid";

const nano = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

export function generateChildId(centerCode) {
  const code = String(centerCode || "CTR").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "CTR";
  return `${code}-${nano()}`;
}

