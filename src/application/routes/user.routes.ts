import { Hono } from "hono";
import { UserController } from "../controller/user.controller";
import { CreateUserDTO, UpdateUserDTO } from "../dto";
import { zValidator } from "@hono/zod-validator";
import { container } from "tsyringe";
import { z } from "zod";

const userRoutes = new Hono();
const userController = container.resolve(UserController);
const idParamSchema = z.object({ id: z.string().min(1) });

// GET /users - Get all users with pagination
userRoutes.get("/", (c) => {
  return userController.getAll(c);
});

// POST /users - Create a new user
userRoutes.post("/", zValidator("json", CreateUserDTO), (c) => {
  return userController.create(c);
});

// GET /users/:id - Get user by ID
userRoutes.get("/:id", zValidator("param", idParamSchema), (c) => {
  return userController.getById(c);
});

// PUT /users/:id - Update user
userRoutes.put(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", UpdateUserDTO),
  (c) => {
    return userController.update(c);
  },
);

// DELETE /users/:id - Delete user
userRoutes.delete("/:id", zValidator("param", idParamSchema), (c) => {
  return userController.delete(c);
});

export default userRoutes;
