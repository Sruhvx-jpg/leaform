import "dotenv/config";
import db from "./index";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runMigrations() {
  console.log("Running migrations...");
  try {
    // 1. Create __drizzle_migrations table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    // 2. Read already applied migrations
    const applied = await db.execute(sql`SELECT hash FROM "__drizzle_migrations";`);
    const appliedHashes = new Set(applied.rows.map((r: any) => r.hash));

    // 3. Scan migrations folder
    const migrationsFolder = path.join(__dirname, "drizzle");
    const files = fs.readdirSync(migrationsFolder)
      .filter(f => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (appliedHashes.has(file)) {
        console.log(`Migration ${file} is already applied. Skipping.`);
        continue;
      }

      console.log(`Applying migration ${file}...`);
      const sqlFile = fs.readFileSync(path.join(migrationsFolder, file), "utf8");
      const statements = sqlFile.split("--> statement-breakpoint");

      // Execute statements sequentially on the database connection
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;
        await db.execute(sql.raw(stmt));
      }

      // Record migration as applied
      await db.execute(sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${file}, ${Date.now()});
      `);
      console.log(`Migration ${file} applied successfully.`);
    }

    console.log("All migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migrations failed:", error);
    process.exit(1);
  }
}

runMigrations();
