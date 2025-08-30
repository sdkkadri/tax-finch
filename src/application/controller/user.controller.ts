import type { Context } from "hono";
import { UserService } from "../service/user.service";
import { inject, injectable } from "tsyringe";

@injectable() 
export class UserController {
  constructor(@inject(UserService) private userService: UserService){}

  async getAll(c: Context) {
    try {
      const users = await this.userService.getAllUsers();
      return c.json({ users });
    } catch (error) {
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  }

  async create(c: Context) {
    console.log("create");
    try {
      const body = await c.req.json();
      const user = await this.userService.createUser(body);
      return c.json({ message: "User created", user }, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Failed to create user" }, 500);
    }
  }

  async getById(c: Context) {
    try {
      const id = c.req.param("id");
      const user = await this.userService.getUserById(id);
      return c.json({ user });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "Failed to fetch user" }, 500);
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const user = await this.userService.updateUser(id, body);
      return c.json({ message: "User updated", user });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Failed to update user" }, 500);
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param("id");
      await this.userService.deleteUser(id);
      return c.json({ message: "User deleted" });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: "Failed to delete user" }, 500);
    }
  }
}
