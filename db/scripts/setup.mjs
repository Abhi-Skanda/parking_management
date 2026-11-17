// Creates all tables. Usage: npm run db:setup
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../pool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = (file) => path.join(__dirname, "..", "sql", file);

async function setup() {
  try {
    const schema = await fs.readFile(sqlFile("schema.sql"), "utf8");
    await pool.query(schema);
    console.log("✅ Schema created");
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();
