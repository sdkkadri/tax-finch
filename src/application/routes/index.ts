import { Hono } from "hono";
import userRoutes from "./user.routes";
import itemRoutes from "./item.routes";

const routes = new Hono();

routes.route("/users", userRoutes);
routes.route("/items", itemRoutes);

export default routes;
