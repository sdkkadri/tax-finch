import { UserEntity } from "../entities/user";
import type { QueryOptions, PaginatedResponse } from "../../application/utils/queryHelper";

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findWithPagination(options: QueryOptions): Promise<PaginatedResponse<UserEntity>>;
  createUser(user: UserEntity): Promise<void>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

export const IUserRepository = Symbol("IUserRepository");
