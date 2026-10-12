import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const { Pool } = pg;

export interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<void>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
}

declare global {
  var __mono_pg_client: DatabaseClient | undefined;
  var __mono_db_initialized: boolean | undefined;
}

const DATA_DIR = path.resolve(process.cwd(), "data/postgres");

async function createDatabaseClient(): Promise<DatabaseClient> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const pool = new Pool({ connectionString: databaseUrl });
    const client: DatabaseClient = {
      async query<T = any>(sql: string, params?: any[]) {
        const res = await pool.query(sql, params);
        return { rows: res.rows as T[] };
      },
      async exec(sql: string) {
        await pool.query(sql);
      },
      async transaction<T>(callback: (txClient: DatabaseClient) => Promise<T>): Promise<T> {
        const txPgClient = await pool.connect();
        try {
          await txPgClient.query("BEGIN");
          const wrapped: DatabaseClient = {
            async query<R = any>(sql: string, params?: any[]) {
              const res = await txPgClient.query(sql, params);
              return { rows: res.rows as R[] };
            },
            async exec(sql: string) {
              await txPgClient.query(sql);
            },
            async transaction() {
              throw new Error("Nested transactions are not supported");
            },
          };
          const result = await callback(wrapped);
          await txPgClient.query("COMMIT");
          return result;
        } catch (err) {
          await txPgClient.query("ROLLBACK");
          throw err;
        } finally {
          txPgClient.release();
        }
      },
    };
    return client;
  }

  // Local persistent PostgreSQL instance using PGlite
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const pglite = new PGlite(DATA_DIR);

  const client: DatabaseClient = {
    async query<T = any>(sql: string, params?: any[]) {
      const res = await pglite.query(sql, params);
      return { rows: res.rows as T[] };
    },
    async exec(sql: string) {
      await pglite.exec(sql);
    },
    async transaction<T>(callback: (txClient: DatabaseClient) => Promise<T>): Promise<T> {
      return await pglite.transaction(async (tx) => {
        const wrapped: DatabaseClient = {
          async query<R = any>(sql: string, params?: any[]) {
            const res = await tx.query(sql, params);
            return { rows: res.rows as R[] };
          },
          async exec(sql: string) {
            await tx.exec(sql);
          },
          async transaction() {
            throw new Error("Nested transactions are not supported");
          },
        };
        return await callback(wrapped);
      });
    },
  };

  return client;
}

let dbPromise: Promise<DatabaseClient> | null = null;

export async function getDb(): Promise<DatabaseClient> {
  if (!globalThis.__mono_pg_client) {
    if (!dbPromise) {
      dbPromise = createDatabaseClient().then(async (client) => {
        globalThis.__mono_pg_client = client;
        await initDatabase(client);
        return client;
      });
    }
    return dbPromise;
  }
  return globalThis.__mono_pg_client;
}

async function initDatabase(client: DatabaseClient) {
  if (globalThis.__mono_db_initialized) return;

  try {
    const schemaPath = path.resolve(process.cwd(), "app/db/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      await client.exec(schemaSql);
    }

    const checkCount = await client.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM products"
    );
    const count = parseInt(checkCount.rows[0]?.count || "0", 10);

    if (count === 0) {
      const seedPath = path.resolve(process.cwd(), "app/db/seed.sql");
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, "utf-8");
        await client.exec(seedSql);
      }
    }

    globalThis.__mono_db_initialized = true;
  } catch (error) {
    console.error("Failed to initialize PostgreSQL database:", error);
  }
}

