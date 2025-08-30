import { UserEntity } from '../../domain/entities/user';
import type { CreateUserDTOType } from '../../application/dto';

export const mockUserData = {
  email: "test@example.com",
  name: "Test User"
};

export const mockUserEntity = new UserEntity(
  "test-id-123",
  "test@example.com", 
  "Test User",
  new Date("2024-01-01T00:00:00.000Z"),
  new Date("2024-01-01T00:00:00.000Z")
);

export const mockCreateUserDTO: CreateUserDTOType = {
  email: "test@example.com",
  name: "Test User"
};

export const mockInvalidUserData = {
  email: "invalid-email",
  name: ""
};

export const mockEmptyUserData = {
  email: "",
  name: ""
};

export const mockLongNameUserData = {
  email: "test@example.com",
  name: "A".repeat(101) // Exceeds 100 character limit
};
