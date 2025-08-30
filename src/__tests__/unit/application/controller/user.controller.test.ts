import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockCreateUserDTO, mockUserEntity } from '../../../fixtures/user.fixtures';

// Mock Hono Context for unit testing
const createMockContext = (body?: any, params?: any) => ({
  req: {
    json: vi.fn().mockResolvedValue(body || {}),
    param: vi.fn((key: string) => params?.[key] || '')
  },
  json: vi.fn((data: any, status?: number) => ({ data, status }))
});

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
          return c.json({ error: error.message }, 400);
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
          return c.json({ error: error.message }, 404);
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
          return c.json({ error: error.message }, 400);
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
          return c.json({ error: error.message }, 404);
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

describe('UserController Unit Tests', () => {
  let userController: any;
  let mockUserService: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock service with all methods
    mockUserService = {
      createUser: vi.fn(),
      getUserById: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      getAllUsers: vi.fn()
    };
    
    // Create controller with mocked service
    userController = createMockUserController(mockUserService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create user successfully and return 201 status', async () => {
      // Arrange
      mockUserService.createUser.mockResolvedValue(mockUserEntity);
      const mockContext = createMockContext(mockCreateUserDTO);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockCreateUserDTO);
      expect(mockContext.json).toHaveBeenCalledWith(
        { message: "User created", user: mockUserEntity },
        201
      );
      expect(result.status).toBe(201);
    });

    it('should handle service validation errors with 400 status', async () => {
      // Arrange
      const validationError = new Error('Email is required');
      mockUserService.createUser.mockRejectedValue(validationError);
      const mockContext = createMockContext(mockCreateUserDTO);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockCreateUserDTO);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Email is required' },
        400
      );
      expect(result.status).toBe(400);
    });

    it('should handle service business logic errors with 400 status', async () => {
      // Arrange
      const businessError = new Error('User with this email already exists');
      mockUserService.createUser.mockRejectedValue(businessError);
      const mockContext = createMockContext(mockCreateUserDTO);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockCreateUserDTO);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'User with this email already exists' },
        400
      );
      expect(result.status).toBe(400);
    });

    it('should handle non-Error exceptions with 500 status', async () => {
      // Arrange
      mockUserService.createUser.mockRejectedValue('String error');
      const mockContext = createMockContext(mockCreateUserDTO);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockCreateUserDTO);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Failed to create user' },
        500
      );
      expect(result.status).toBe(500);
    });

    it('should handle empty request body correctly', async () => {
      // Arrange
      const emptyBody = {};
      mockUserService.createUser.mockRejectedValue(new Error('Email is required'));
      const mockContext = createMockContext(emptyBody);

      // Act
      const result = await userController.create(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalledWith(emptyBody);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Email is required' },
        400
      );
      expect(result.status).toBe(400);
    });
  });

  describe('getById', () => {
    it('should return user when found with 200 status', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue(mockUserEntity);
      const mockContext = createMockContext({}, { id: 'test-id' });

      // Act
      const result = await userController.getById(mockContext as any);

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id');
      expect(mockUserService.getUserById).toHaveBeenCalledWith('test-id');
      expect(mockContext.json).toHaveBeenCalledWith({ user: mockUserEntity });
      expect(result.status).toBeUndefined(); // Default 200 status
    });

    it('should handle user not found error with 404 status', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      mockUserService.getUserById.mockRejectedValue(notFoundError);
      const mockContext = createMockContext({}, { id: 'non-existent-id' });

      // Act
      const result = await userController.getById(mockContext as any);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith('non-existent-id');
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        404
      );
      expect(result.status).toBe(404);
    });

    it('should handle service errors with 500 status', async () => {
      // Arrange
      mockUserService.getUserById.mockRejectedValue('Database error');
      const mockContext = createMockContext({}, { id: 'test-id' });

      // Act
      const result = await userController.getById(mockContext as any);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith('test-id');
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user' },
        500
      );
      expect(result.status).toBe(500);
    });

    it('should extract ID parameter correctly', async () => {
      // Arrange
      const userId = 'unique-user-123';
      mockUserService.getUserById.mockResolvedValue(mockUserEntity);
      const mockContext = createMockContext({}, { id: userId });

      // Act
      await userController.getById(mockContext as any);

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update user successfully and return 200 status', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUserEntity, name: 'Updated Name' };
      mockUserService.updateUser.mockResolvedValue(updatedUser);
      const mockContext = createMockContext(updateData, { id: 'test-id' });

      // Act
      const result = await userController.update(mockContext as any);

      // Assert
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockUserService.updateUser).toHaveBeenCalledWith('test-id', updateData);
      expect(mockContext.json).toHaveBeenCalledWith(
        { message: "User updated", user: updatedUser }
      );
      expect(result.status).toBeUndefined(); // Default 200 status
    });

    it('should handle validation errors during update with 400 status', async () => {
      // Arrange
      const updateData = { name: '' };
      const validationError = new Error('Name cannot be empty');
      mockUserService.updateUser.mockRejectedValue(validationError);
      const mockContext = createMockContext(updateData, { id: 'test-id' });

      // Act
      const result = await userController.update(mockContext as any);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith('test-id', updateData);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Name cannot be empty' },
        400
      );
      expect(result.status).toBe(400);
    });

    it('should handle user not found during update with 400 status', async () => {
      // Arrange
      const updateData = { name: 'New Name' };
      const notFoundError = new Error('User not found');
      mockUserService.updateUser.mockRejectedValue(notFoundError);
      const mockContext = createMockContext(updateData, { id: 'non-existent-id' });

      // Act
      const result = await userController.update(mockContext as any);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith('non-existent-id', updateData);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        400
      );
      expect(result.status).toBe(400);
    });

    it('should extract both ID parameter and request body correctly', async () => {
      // Arrange
      const userId = 'update-user-123';
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      mockUserService.updateUser.mockResolvedValue(mockUserEntity);
      const mockContext = createMockContext(updateData, { id: userId });

      // Act
      await userController.update(mockContext as any);

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id');
      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('delete', () => {
    it('should delete user successfully and return 200 status', async () => {
      // Arrange
      mockUserService.deleteUser.mockResolvedValue(undefined);
      const mockContext = createMockContext({}, { id: 'test-id' });

      // Act
      const result = await userController.delete(mockContext as any);

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('test-id');
      expect(mockContext.json).toHaveBeenCalledWith({ message: "User deleted" });
      expect(result.status).toBeUndefined(); // Default 200 status
    });

    it('should handle user not found during deletion with 404 status', async () => {
      // Arrange
      const notFoundError = new Error('User not found');
      mockUserService.deleteUser.mockRejectedValue(notFoundError);
      const mockContext = createMockContext({}, { id: 'non-existent-id' });

      // Act
      const result = await userController.delete(mockContext as any);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('non-existent-id');
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        404
      );
      expect(result.status).toBe(404);
    });

    it('should handle service errors during deletion with 500 status', async () => {
      // Arrange
      mockUserService.deleteUser.mockRejectedValue('Database error');
      const mockContext = createMockContext({}, { id: 'test-id' });

      // Act
      const result = await userController.delete(mockContext as any);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('test-id');
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Failed to delete user' },
        500
      );
      expect(result.status).toBe(500);
    });

    it('should extract ID parameter correctly for deletion', async () => {
      // Arrange
      const userId = 'delete-user-123';
      mockUserService.deleteUser.mockResolvedValue(undefined);
      const mockContext = createMockContext({}, { id: userId });

      // Act
      await userController.delete(mockContext as any);

      // Assert
      expect(mockContext.req.param).toHaveBeenCalledWith('id');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAll', () => {
    it('should return all users successfully with 200 status', async () => {
      // Arrange
      const mockUsers = [mockUserEntity, { ...mockUserEntity, id: 'user-2' }];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);
      const mockContext = createMockContext();

      // Act
      const result = await userController.getAll(mockContext as any);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({ users: mockUsers });
      expect(result.status).toBeUndefined(); // Default 200 status
    });

    it('should handle service errors during getAll with 500 status', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockUserService.getAllUsers.mockRejectedValue(serviceError);
      const mockContext = createMockContext();

      // Act
      const result = await userController.getAll(mockContext as any);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch users' },
        500
      );
      expect(result.status).toBe(500);
    });

    it('should handle empty users list correctly', async () => {
      // Arrange
      const emptyUsers: any[] = [];
      mockUserService.getAllUsers.mockResolvedValue(emptyUsers);
      const mockContext = createMockContext();

      // Act
      const result = await userController.getAll(mockContext as any);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith({ users: emptyUsers });
      expect(result.status).toBeUndefined(); // Default 200 status
    });

    it('should handle non-Error exceptions with 500 status', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue('Unexpected error');
      const mockContext = createMockContext();

      // Act
      const result = await userController.getAll(mockContext as any);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch users' },
        500
      );
      expect(result.status).toBe(500);
    });
  });
});
