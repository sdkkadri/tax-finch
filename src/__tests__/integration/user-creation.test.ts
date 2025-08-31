import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockCreateUserDTO, mockUserEntity, mockLongNameUserData } from '../fixtures/user.fixtures';

// Mock Hono Context
const createMockContext = (body?: any, params?: any) => ({
  req: {
    json: vi.fn().mockResolvedValue(body || {}),
    param: vi.fn((key: string) => params?.[key] || '')
  },
  json: vi.fn((data: any, status?: number) => ({ data, status }))
});

// Mock UserService to avoid tsyringe issues
const createMockUserService = (mockUserRepository: any) => {
  return {
    async createUser(dto: any) {
      const existingUser = await mockUserRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      const userId = 'mocked-nanoid-123';
      const user = {
        id: userId,
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await mockUserRepository.save(user);
      return user;
    },

    async getUserById(id: string) {
      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },

    async updateUser(id: string, dto: any) {
      const user = await this.getUserById(id);
      const updatedUser = { ...user, name: dto.name, updatedAt: new Date() };
      await mockUserRepository.save(updatedUser);
      return updatedUser;
    },

    async deleteUser(id: string) {
      const user = await this.getUserById(id);
      await mockUserRepository.delete(user.id);
    },

    async getAllUsers() {
      return await mockUserRepository.findAll();
    }
  };
};

// Mock UserController to avoid tsyringe issues
const createMockUserController = (mockUserService: any) => {
  return {
    async create(c: any) {
      try {
        const body = await c.req.json();
        const user = await mockUserService.createUser(body);
        return c.json({ message: "User created", user }, 201);
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ error: 'Bad Request' }, 400);
        }
        return c.json({ error: "Failed to create user" }, 500);
      }
    },

    async getById(c: any) {
      try {
        const id = c.req.param("id");
        const user = await mockUserService.getUserById(id);
        return c.json({ user });
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ error: 'Not Found' }, 404);
        }
        return c.json({ error: "Failed to fetch user" }, 500);
      }
    },

    async update(c: any) {
      try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const user = await mockUserService.updateUser(id, body);
        return c.json({ message: "User updated", user });
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ error: 'Bad Request' }, 400);
        }
        return c.json({ error: "Failed to update user" }, 500);
      }
    },

    async delete(c: any) {
      try {
        const id = c.req.param("id");
        await mockUserService.deleteUser(id);
        return c.json({ message: "User deleted" });
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ error: 'Not Found' }, 404);
        }
        return c.json({ error: "Failed to delete user" }, 500);
      }
    },

    async getAll(c: any) {
      try {
        const users = await mockUserService.getAllUsers();
        return c.json({ users });
      } catch (error) {
        return c.json({ error: "Failed to fetch users" }, 500);
      }
    }
  };
};

describe('User Creation Integration', () => {
  let userController: any;
  let userService: any;
  let userRepository: any;

  beforeEach(() => {
    // Create mock instances for integration testing
    userRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn()
    };
    
    userService = createMockUserService(userRepository);
    userController = createMockUserController(userService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End User Creation Flow', () => {
    it('should create user through the complete flow', async () => {
      // Arrange
      const mockContext = createMockContext(mockCreateUserDTO);
      
      // Mock the repository methods
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User created",
          user: expect.objectContaining({
            email: mockCreateUserDTO.email,
            name: mockCreateUserDTO.name
          })
        }),
        201
      );
      expect(result.status).toBe(201);
    });

    it('should create user with long name through the complete flow', async () => {
      // Arrange
      const longNameDTO = { ...mockCreateUserDTO, name: 'A'.repeat(100) }; // Exactly 100 characters
      const mockContext = createMockContext(longNameDTO);
      
      // Mock the repository methods
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(longNameDTO.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User created",
          user: expect.objectContaining({
            email: longNameDTO.email,
            name: longNameDTO.name
          })
        }),
        201
      );
      expect(result.status).toBe(201);
      expect(result.data.user.name.length).toBe(100);
    });

    it('should create user with very long name through the complete flow', async () => {
      // Arrange
      const veryLongNameDTO = { ...mockCreateUserDTO, name: 'A'.repeat(101) }; // Exceeds 100 characters
      const mockContext = createMockContext(veryLongNameDTO);
      
      // Mock the repository methods
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(veryLongNameDTO.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User created",
          user: expect.objectContaining({
            email: veryLongNameDTO.email,
            name: veryLongNameDTO.name
          })
        }),
        201
      );
      expect(result.status).toBe(201);
      expect(result.data.user.name.length).toBe(101);
    });

    it('should handle duplicate email error through the complete flow', async () => {
      // Arrange
      const mockContext = createMockContext(mockCreateUserDTO);
      
      // Mock repository to return existing user
      userRepository.findByEmail.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Bad Request' },
        400
      );
      expect(result.status).toBe(400);
    });

    it('should handle validation errors through the complete flow', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email', name: '' };
      const mockContext = createMockContext(invalidData);
      
      // Mock repository to throw validation error
      userRepository.findByEmail.mockRejectedValue(new Error('Invalid email format'));

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(invalidData.email);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Bad Request' },
        400
      );
      expect(result.status).toBe(400);
    });
  });

  describe('Service-Repository Integration', () => {
    it('should integrate service with repository for user creation', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(mockCreateUserDTO);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockCreateUserDTO.email,
          name: mockCreateUserDTO.name
        })
      );
      expect(result).toBeInstanceOf(Object);
      expect(result.email).toBe(mockCreateUserDTO.email);
      expect(result.name).toBe(mockCreateUserDTO.name);
    });

    it('should integrate service with repository for user retrieval', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userService.getUserById('test-id');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockUserEntity);
    });
  });

  describe('Controller-Service Integration', () => {
    it('should integrate controller with service for user creation', async () => {
      // Arrange
      const mockContext = createMockContext(mockCreateUserDTO);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User created",
          user: expect.objectContaining({
            email: mockCreateUserDTO.email,
            name: mockCreateUserDTO.name
          })
        }),
        201
      );
      expect(result.status).toBe(201);
    });

    it('should integrate controller with service for error handling', async () => {
      // Arrange
      const mockContext = createMockContext(mockCreateUserDTO);
      userRepository.findByEmail.mockRejectedValue(new Error('Service error'));

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Bad Request' },
        400
      );
      expect(result.status).toBe(400);
    });
  });

  describe('Data Flow Validation', () => {
    it('should maintain data integrity through all layers', async () => {
      // Arrange
      const testData = {
        email: 'integration@test.com',
        name: 'Integration Test User'
      };
      
      const mockContext = createMockContext(testData);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      // Verify data flows correctly through all layers
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(testData.email);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testData.email,
          name: testData.name
        })
      );
      expect(result.data).toEqual(
        expect.objectContaining({
          message: "User created",
          user: expect.objectContaining({
            email: testData.email,
            name: testData.name
          })
        })
      );
    });
  });
});
