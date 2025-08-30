import { UserEntity } from "../entities/user";

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<UserEntity[]>;
}

export const IUserRepository = Symbol("IUserRepository");
