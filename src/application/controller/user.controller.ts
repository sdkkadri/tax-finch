import type { Context } from "hono";
import { UserService } from "../service/user.service";
import { inject, injectable } from "tsyringe";
import { AppError } from "../utils/app-error";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";

@injectable()
export class UserController {
  constructor(@inject(UserService) private userService: UserService){}

  async getAll(c: Context) {
    // Get query options from middleware (set by queryParser)
    const queryOptions = c.get("queryOptions") as QueryOptions;
    
    if (!queryOptions) {
      throw new AppError("Query options not found. Make sure queryParser middleware is configured.", 500);
    }
    
    // Get paginated results using the new query engine
    const result = await this.userService.getUsersWithPagination(queryOptions);
    
    return c.json(result);
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
