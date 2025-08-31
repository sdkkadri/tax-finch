import { eq } from "drizzle-orm";
import { UserEntity } from "../../../domain/entities/user";
import type { IUserRepository } from "../../../domain/repositories/iuser.repository";
import { usersTable } from "../schema/users";
import { injectable, inject } from "tsyringe";
import type { Database } from "../schema";
import { EntityConverter } from "../utils/entity-converter";

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject("Database") private db: Database
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    
    return result.length > 0 ? EntityConverter.fromRow(UserEntity, result[0]) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    
    return result.length > 0 ? EntityConverter.fromRow(UserEntity, result[0]) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const results = await this.db.select().from(usersTable);
    return results.map(row => EntityConverter.fromRow(UserEntity, row));
  }

  async createUser(user: UserEntity): Promise<void> {
    await this.db
      .insert(usersTable)
      .values({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
  }

  async updateUser(user: UserEntity): Promise<void> {
    await this.db
      .update(usersTable)
      .set({
        name: user.name,
        updatedAt: user.updatedAt
      })
      .where(eq(usersTable.id, user.id));
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.delete(usersTable).where(eq(usersTable.id, id));
  }
}