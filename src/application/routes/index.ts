import { Hono } from "hono";
import userRoutes from "./user.routes";
import itemRoutes from "./item.routes";
import orderRoutes from "./order.routes";
import { queryParser } from "../../infrastructure/database/middlewares";

const routes = new Hono();

// Apply query parser middleware to all routes
routes.use("*", queryParser());

routes.route("/users", userRoutes);
routes.route("/items", itemRoutes);
routes.route("/orders", orderRoutes);

export default routes;
