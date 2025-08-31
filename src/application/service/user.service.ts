import { use } from "hono/jsx";
import { UserEntity } from "../../domain/entities/user";
import type { IUserRepository } from "../../domain/repositories/iuser.repository";
import type { CreateUserDTOType, UpdateUserDTOType } from "../dto";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { UserRepository } from "infrastructure/database/repositories/UserRepository";
import { AppError } from "../utils/app-error";

@injectable()
export class UserService {

  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  async createUser(dto: CreateUserDTOType): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw AppError.conflict("A user with this email already exists", "email_exists");
    }

    const userId = nanoid();
    const user = UserEntity.create(dto.email, dto.name, userId);
    await this.userRepository.save(user);
    return user;
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found", "user_not_found");
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDTOType): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const updatedUser = user.updateName(dto.name);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.delete(user.id);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
  }
}
