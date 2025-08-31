import type { Context } from "hono";
import { UserService } from "../service/user.service";
import { inject, injectable } from "tsyringe";
import { AppError } from "../utils/app-error";

@injectable()
export class UserController {
  constructor(@inject(UserService) private userService: UserService){}

  async getAll(c: Context) {
    const users = await this.userService.getAllUsers();
    return c.json({ users });
  }

  async create(c: Context) {
    const body = await c.req.json();
    const user = await this.userService.createUser(body);
    return c.json({ message: "User created", user }, 201);
  }

  async getById(c: Context) {
    const id = c.req.param("id");
    const user = await this.userService.getUserById(id);
    return c.json({ user });
  }

  async update(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json();
    const user = await this.userService.updateUser(id, body);
    return c.json({ message: "User updated", user });
  }

  async delete(c: Context) {
    const id = c.req.param("id");
    await this.userService.deleteUser(id);
    return c.json({ message: "User deleted" });
  }
}
