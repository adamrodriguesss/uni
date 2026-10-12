import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const DATA_DIR = path.resolve(process.cwd(), "data/postgres");

async function main() {
  console.log("🌱 Seeding Monolithic E-Commerce Database...");
  const databaseUrl = process.env.DATABASE_URL;

  let execFn;

  if (databaseUrl) {
    console.log("Connecting to PostgreSQL at", databaseUrl);
    const pool = new pg.Pool({ connectionString: databaseUrl });
    execFn = async (sql) => pool.query(sql);
  } else {
    console.log("Connecting to local PostgreSQL instance at", DATA_DIR);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const pglite = new PGlite(DATA_DIR);
    execFn = async (sql) => pglite.exec(sql);
  }

  const schemaPath = path.resolve(process.cwd(), "app/db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  await execFn(schemaSql);
  console.log("✓ Applied schema.sql");

  const seedPath = path.resolve(process.cwd(), "app/db/seed.sql");
  const seedSql = fs.readFileSync(seedPath, "utf-8");
  await execFn(seedSql);
  console.log("✓ Executed seed.sql");

  console.log("✨ Seeding completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

