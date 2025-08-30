import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { singleton } from "tsyringe";
import { loadDatabaseConfig, getDatabaseConnectionString, getConnectionPoolConfig } from "./config";
import { schema } from "./schema";
import type { Database } from "./schema";

// Token for dependency injection
export const DATABASE_TOKEN = "Database";

@singleton()
export class DatabaseConnection {
  private pool: Pool;
  private db: Database;

  constructor() {
    // Load and validate config
    const config = loadDatabaseConfig();

    // Build connection
    this.pool = new Pool({
      connectionString: getDatabaseConnectionString(config),
      ...getConnectionPoolConfig(config),
    });

    // Wrap with drizzle
    this.db = drizzle(this.pool, { schema });
  }

  getDatabase(): Database {
    return this.db;
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}
