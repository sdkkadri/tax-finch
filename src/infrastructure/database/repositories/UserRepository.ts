import { eq } from "drizzle-orm";
import { UserEntity } from "../../../domain/entities/user";
import type { IUserRepository } from "../../../domain/repositories/iuser.repository";
import { usersTable } from "../schema/users";
import { injectable, inject } from "tsyringe";
import type { Database } from "../schema";
import { DATABASE_TOKEN } from "../connection";

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject("Database") private db: Database
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    if (!id || id.trim() === '') {
      throw new Error("User ID is required");
    }

    try {
      const result = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);
      
      return result.length > 0 ? this.toDomain(result[0]) : null;
    } catch (error) {
      console.error(`Failed to find user by ID ${id}:`, error);
      throw new Error("Failed to retrieve user from database");
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email || email.trim() === '') {
      throw new Error("Email is required");
    }

    try {
      const result = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email)) // Fixed: was using .id instead of .email
        .limit(1);
      
      return result.length > 0 ? this.toDomain(result[0]) : null;
    } catch (error) {
      console.error(`Failed to find user by email ${email}:`, error);
      throw new Error("Failed to retrieve user from database");
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const results = await this.db.select().from(usersTable);
      return results.map((row: any) => this.toDomain(row));
    } catch (error) {
      console.error("Failed to retrieve all users:", error);
      throw new Error("Failed to retrieve users from database");
    }
  }

  async save(user: UserEntity): Promise<void> {
    if (!user) {
      throw new Error("User entity is required");
    }

    try {
      await this.db
        .insert(usersTable)
        .values(this.fromDomain(user))
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            name: user.name,
            updatedAt: user.updatedAt,
          },
        });
    } catch (error) {
      console.error(`Failed to save user ${user.id}:`, error);
      throw new Error("Failed to save user to database");
    }
  }

  async delete(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error("User ID is required");
    }

    try {
      await this.db.delete(usersTable).where(eq(usersTable.id, id));
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw new Error("Failed to delete user from database");
    }
  }

  private toDomain(row: any): UserEntity {
    return new UserEntity(
      row.id,
      row.email,
      row.name,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }

  private fromDomain(user: UserEntity) {
    return {
      id: user.id,
      email: user.email, // Fixed: was using user.name instead of user.email
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}