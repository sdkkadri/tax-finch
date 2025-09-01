import { UserEntity } from "../../domain/entities/user";
import type { IUserRepository } from "../../domain/repositories/iuser.repository";
import type { CreateUserDTOType, UpdateUserDTOType } from "../dto";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { IUserRepository as IUserRepositoryToken } from "../../domain/repositories/iuser.repository";
import { AppError } from "../utils/app-error";
import type { QueryOptions } from "../../infrastructure/database/middlewares/queryParser";
import type { PaginatedResponse } from "../../domain/types";

@injectable()
export class UserService {

  constructor(@inject(IUserRepositoryToken) private userRepository: IUserRepository) {}

  /**
   * Creates a new user
   * @param dto - User creation data (already validated by Zod)
   * @returns Promise<UserEntity> - The created user entity
   * @throws AppError.conflict if email already exists
   */
  async createUser(dto: CreateUserDTOType): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw AppError.conflict("A user with this email already exists", "email_exists");
    }

    const userId = nanoid();
    const user = UserEntity.create(dto.email, dto.name, userId);
    await this.userRepository.createUser(user);
    return user;
  }

  /**
   * Retrieves a user by their ID
   * @param id - User ID to search for (already validated by Zod)
   * @returns Promise<UserEntity> - The found user entity
   * @throws AppError.notFound if user doesn't exist
   */
  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found", "user_not_found");
    }
    return user;
  }

  /**
   * Updates an existing user's information
   * @param id - User ID to update (already validated by Zod)
   * @param dto - Update data (already validated by Zod)
   * @returns Promise<UserEntity> - The updated user entity
   * @throws AppError.notFound if user doesn't exist
   */
  async updateUser(id: string, dto: UpdateUserDTOType): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const updatedUser = user.updateName(dto.name);
    await this.userRepository.updateUser(updatedUser);
    return updatedUser;
  }

  /**
   * Deletes a user by their ID
   * @param id - User ID to delete (already validated by Zod)
   * @throws AppError.notFound if user doesn't exist
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.deleteUser(user.id);
  }

  /**
   * Retrieves all users from the system
   * @returns Promise<UserEntity[]> - Array of all user entities
   */
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Retrieves users with cursor-based pagination, sorting, and filtering
   * @param options - Query options including pagination, sorting, and filtering
   * @returns Promise<PaginatedResponse<UserEntity>> - Paginated response with users and metadata
   */
  async getUsersWithPagination(options: QueryOptions): Promise<PaginatedResponse<UserEntity>> {
    return await this.userRepository.findWithPagination(options);
  }
}
