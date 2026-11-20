// Creates (or promotes) an admin with a real bcrypt hash.
// Usage: npm run db:admin -- admin@park.com 'StrongPassw0rd' "Admin Name"
import bcrypt from "bcryptjs";
import pg from "pg";

const [, , email, password, name = "Admin"] = process.argv;

if (!email || !password || password.length < 8) {
  console.error("Usage: npm run db:admin -- <email> <password (8+ chars)> [name]");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, LOWER($2), $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
     RETURNING id, email, role`,
    [name, email, hash]
  );
  console.log("✅ Admin ready:", rows[0]);
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
