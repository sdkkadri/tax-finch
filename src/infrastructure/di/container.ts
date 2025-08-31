import "reflect-metadata";
import { container } from "tsyringe";

// Import database registrations first
import "./database.container";

// Import the auto-generated container with application classes
import "./auto-container";

console.log("Main container initialized with database and auto-generated registrations");
