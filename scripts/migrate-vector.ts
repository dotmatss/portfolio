import "dotenv/config";
import { pgPool } from "../lib/db/pg";
import * as fs from "fs";
import * as path from "path";

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, "migrate-vector.sql"),
    "utf-8"
  );

  console.log("Running pgvector migration...");
  await pgPool.query(sql);
  console.log("pgvector extension enabled and indexes created.");

  await pgPool.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
