import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseConnection, DATABASE_TOKEN } from "./connection";
import type { Database } from "./schema";

// Register the database connection as a singleton
container.registerSingleton(DatabaseConnection);

// Register the Database instance via factory from the singleton connection
container.register<Database>(DATABASE_TOKEN, {
  useFactory: (c) => c.resolve(DatabaseConnection).getDatabase(),
});
