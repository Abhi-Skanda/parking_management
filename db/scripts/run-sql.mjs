// Shared helper: runs SQL files in order against DATABASE_URL
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runSqlFiles(files, doneMessage) {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    for (const file of files) {
      const sql = await fs.readFile(path.join(__dirname, "..", "sql", file), "utf8");
      await client.query(sql);
      console.log(`✅ ${file}`);
    }
    console.log(doneMessage);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
