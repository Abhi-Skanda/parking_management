// Inserts sample data. Usage: npm run db:seed
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../pool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  try {
    const sql = await fs.readFile(path.join(__dirname, "..", "sql", "seed.sql"), "utf8");
    await pool.query(sql);
    console.log("✅ Seed data inserted");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
