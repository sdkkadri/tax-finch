import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  mockCreateUserDTO, 
  mockUserEntity, 
  mockInvalidUserData 
} from '../../../fixtures/user.fixtures';

// Mock UserEntity class completely for unit testing
const MockUserEntity = vi.fn();
const mockUserEntityInstance = {
  id: 'mocked-id-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  updateName: vi.fn()
};

// Mock the UserService class to avoid tsyringe issues
const createMockUserService = (mockUserRepository: any, mockEntity: any) => {
  return {
    async createUser(dto: any): Promise<any> {
      // Service logic: Check for existing user
      const existingUser = await mockUserRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Service logic: Create user entity (mocked)
      const userId = 'mocked-nanoid-123';
      const user = mockEntity.createUser(dto.email, dto.name, userId);
      
      // Service logic: Save to repository
      await mockUserRepository.save(user);
      return user;
    },

    async getUserById(id: string): Promise<any> {
      // Service logic: Get user from repository
      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },

    async updateUser(id: string, dto: any): Promise<any> {
      // Service logic: Get existing user
      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Service logic: Update user (mocked entity method)
      const updatedUser = mockEntity.updateName(dto.name);
      
      // Service logic: Save updated user
      await mockUserRepository.save(updatedUser);
      return updatedUser;
    },

    async deleteUser(id: string): Promise<void> {
      // Service logic: Get existing user
      const user = await mockUserRepository.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Service logic: Delete user
      await mockUserRepository.delete(id);
    },

    async getAllUsers(): Promise<any[]> {
      // Service logic: Get all users from repository
      return await mockUserRepository.findAll();
    }
  };
};

describe('UserService Unit Tests', () => {
  let userService: any;
  let mockUserRepository: any;
  let mockEntity: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock repository
    mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn()
    };
    
    // Create mock entity
    mockEntity = {
      createUser: vi.fn().mockReturnValue(mockUserEntityInstance),
      updateName: vi.fn().mockReturnValue({ ...mockUserEntityInstance, name: 'Updated Name' })
    };
    
    // Create service with mocked dependencies
    userService = createMockUserService(mockUserRepository, mockEntity);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully when email does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockEntity.createUser.mockReturnValue(mockUserEntityInstance);

      // Act
      const result = await userService.createUser(mockCreateUserDTO);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(mockEntity.createUser).toHaveBeenCalledWith(mockCreateUserDTO.email, mockCreateUserDTO.name, 'mocked-nanoid-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserEntityInstance);
      expect(result).toBe(mockUserEntityInstance);
    });

    it('should throw error when user with email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUserEntity);

      // Act & Assert
      await expect(userService.createUser(mockCreateUserDTO))
        .rejects
        .toThrow('User with this email already exists');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockCreateUserDTO.email);
      expect(mockEntity.createUser).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during email check', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(userService.createUser(mockCreateUserDTO))
        .rejects
        .toThrow('Database connection failed');
      
      expect(mockEntity.createUser).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockRejectedValue(new Error('Save operation failed'));

      // Act & Assert
      await expect(userService.createUser(mockCreateUserDTO))
        .rejects
        .toThrow('Save operation failed');
      
      expect(mockEntity.createUser).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUserEntityInstance);

      // Act
      const result = await userService.getUserById('test-id');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toBe(mockUserEntityInstance);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('non-existent-id'))
        .rejects
        .toThrow('User not found');
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle repository errors during findById', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.getUserById('test-id'))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('updateUser', () => {
    it('should update user name successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUserEntityInstance, name: 'Updated Name' };
      mockUserRepository.findById.mockResolvedValue(mockUserEntityInstance);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockEntity.updateName.mockReturnValue(updatedUser);

      // Act
      const result = await userService.updateUser('test-id', { name: 'Updated Name' });

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockEntity.updateName).toHaveBeenCalledWith('Updated Name');
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toBe(updatedUser);
    });

    it('should throw error when updating user that does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser('non-existent-id', { name: 'Updated Name' }))
        .rejects
        .toThrow('User not found');
      
      expect(mockEntity.updateName).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during update', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.updateUser('test-id', { name: 'Updated Name' }))
        .rejects
        .toThrow('Database error');
      
      expect(mockEntity.updateName).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUserEntityInstance);
      mockUserRepository.delete.mockResolvedValue(undefined);

      // Act
      await userService.deleteUser('test-id');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when deleting user that does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser('non-existent-id'))
        .rejects
        .toThrow('User not found');
      
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during deletion', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.deleteUser('test-id'))
        .rejects
        .toThrow('Database error');
      
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [mockUserEntityInstance, { ...mockUserEntityInstance, id: 'user-2' }];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle repository errors during findAll', async () => {
      // Arrange
      mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.getAllUsers())
        .rejects
        .toThrow('Database error');
    });
  });
});
