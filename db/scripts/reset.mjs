// Drops everything, recreates the schema, and seeds. Usage: npm run db:reset
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../pool.ts";
import { runSqlFiles } from "./run-sql.mjs";
await runSqlFiles(["drop.sql", "schema.sql", "seed.sql"], "Database reset");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFile(path.join(__dirname, "..", "sql", f), "utf8");

async function reset() {
  try {
    await pool.query(await read("drop.sql"));
    console.log("🗑️  Tables dropped");
    await pool.query(await read("schema.sql"));
    console.log("✅ Schema created");
    await pool.query(await read("seed.sql"));
    console.log("✅ Seed data inserted");
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

reset();
