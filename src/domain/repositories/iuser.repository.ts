import { UserEntity } from "../entities/user";

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  createUser(user: UserEntity): Promise<void>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

export const IUserRepository = Symbol("IUserRepository");
