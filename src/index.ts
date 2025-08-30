import "reflect-metadata";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import routes from "./application/routes";
import "./infrastructure/database/container";

// Export database types and schema for use throughout the application
export { schema } from "./infrastructure/database/schema";
export type { Database } from "./infrastructure/database/schema";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!1234");
});

app.route("/api", routes);
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
