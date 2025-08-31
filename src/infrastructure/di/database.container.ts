import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseConnection, DATABASE_TOKEN } from "../database/connection";
import type { Database } from "../database/schema";

// Database registrations
container.registerSingleton(DatabaseConnection);
container.register<Database>(DATABASE_TOKEN, {
  useFactory: (c) => c.resolve(DatabaseConnection).getDatabase(),
});

console.log("Database container initialized");
