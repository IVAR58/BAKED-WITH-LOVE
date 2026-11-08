import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const password = "30.11.1998";

const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const r = await pool.query(
  "update admins set password_hash = $1 returning username",
  [hash],
);
if (r.rows.length === 0) {
  await pool.query(
    "insert into admins (username, password_hash) values ($1, $2)",
    ["luna", hash],
  );
  console.log("تم إنشاء الأدمن: luna");
} else {
  console.log("تم تغيير الباسورد للحساب:", r.rows[0].username);
}
await pool.end();
