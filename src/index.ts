import "reflect-metadata";
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { container } from "tsyringe";
import { DatabaseConnection } from "./infrastructure/database/connection";
import routes from "./application/routes";
import "./infrastructure/database/container";

// Export database types and schema for use throughout the application
export { schema } from "./infrastructure/database/schema";
export type { Database } from "./infrastructure/database/schema";

const app = new Hono();

// Global middleware: CORS and security headers
app.use("*", cors());
app.use("*", secureHeaders());

app.get("/", (c) => {
  return c.text("Hello Hono!1234");
});

app.route("/api", routes);

// Not found handler
app.notFound((c) => c.json({ error: "Not Found" }, 404));

// Global error handler with sanitized logging
app.onError((err, c) => {
  const isProduction = process.env.NODE_ENV === "production";
  const logPayload: Record<string, unknown> = {
    name: err.name,
    message: err.message,
  };
  if (!isProduction && err.stack) {
    logPayload.stack = err.stack;
  }
  console.error("Unhandled application error:", logPayload);
  return c.json({ error: isProduction ? "Internal Server Error" : err.message }, 500);
});

const port = parseInt(process.env.PORT ?? "3000", 10);

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

// Graceful shutdown
let isShuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  const shutdownTimer = setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10_000);

  try {
    // Close DB connection
    const dbConnection = container.resolve(DatabaseConnection);
    await dbConnection.disconnect();
  } catch (e) {
    console.error("Error during DB disconnect:", e instanceof Error ? { name: e.name, message: e.message } : e);
  }

  // Close HTTP server
  try {
    server.close(() => {
      clearTimeout(shutdownTimer);
      console.log("HTTP server closed. Bye!");
      process.exit(0);
    });
  } catch (e) {
    clearTimeout(shutdownTimer);
    console.error("Error closing HTTP server:", e instanceof Error ? { name: e.name, message: e.message } : e);
    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});
