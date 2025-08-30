import { Hono } from "hono";
import userRoutes from "./user.routes";

const routes = new Hono();

routes.route("/users", userRoutes);

export default routes;
