import "reflect-metadata";
import { container } from "tsyringe";
import { DatabaseConnection, DATABASE_TOKEN } from "./connection";

// Register the database connection as a singleton
container.registerSingleton(DatabaseConnection);

// Create and register the Database instance directly
const connection = new DatabaseConnection();
container.registerInstance(DATABASE_TOKEN, connection.getDatabase());
