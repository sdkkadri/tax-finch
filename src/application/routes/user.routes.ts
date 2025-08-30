import { Hono } from "hono";
import { UserController } from "../controller/user.controller";
import { CreateUserDTO, UpdateUserDTO } from "../dto";
import { zValidator } from "@hono/zod-validator";
import { container } from "tsyringe";

const userRoutes = new Hono();

// GET /users - Get all users with pagination
userRoutes.get("/", (c) => {
  const userController = container.resolve(UserController);
  return userController.getAll(c);
});

// POST /users - Create a new user
userRoutes.post("/", zValidator("json", CreateUserDTO), (c) => {
  return container.resolve(UserController).create(c);
});

// GET /users/:id - Get user by ID
userRoutes.get("/:id", (c) => {
  const userController = container.resolve(UserController);
  return userController.getById(c);
});

// PUT /users/:id - Update user
userRoutes.put("/:id", zValidator("json", UpdateUserDTO), (c) => {
  const userController = container.resolve(UserController);
  return userController.update(c);
});

// DELETE /users/:id - Delete user
userRoutes.delete("/:id", (c) => {
  const userController = container.resolve(UserController);
  return userController.delete(c);
});

export default userRoutes;
