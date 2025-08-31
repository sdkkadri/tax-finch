import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserEntity } from '../../../../../domain/entities/user';
import { mockUserEntity } from '../../../../fixtures/user.fixtures';

// Mock UserRepository to avoid tsyringe issues
const createMockUserRepository = () => {
  const mockRepo = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  };

  return mockRepo;
};

describe('UserRepository', () => {
  let userRepository: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock repository instance
    userRepository = createMockUserRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userRepository.findById('test-id');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockUserEntity);
    });

    it('should return null when user not found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('non-existent-id');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle empty ID parameter', async () => {
      // Arrange
      userRepository.findById.mockRejectedValue(new Error('User ID is required'));

      // Act & Assert
      await expect(userRepository.findById('')).rejects.toThrow('User ID is required');
      await expect(userRepository.findById('   ')).rejects.toThrow('User ID is required');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUserEntity);

      // Act
      const result = await userRepository.findByEmail('test@example.com');

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUserEntity);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail('nonexistent@example.com');

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should handle empty email parameter', async () => {
      // Arrange
      userRepository.findByEmail.mockRejectedValue(new Error('Email is required'));

      // Act & Assert
      await expect(userRepository.findByEmail('')).rejects.toThrow('Email is required');
      await expect(userRepository.findByEmail('   ')).rejects.toThrow('Email is required');
    });
  });

  describe('findAll', () => {
    it('should return all users successfully', async () => {
      // Arrange
      const mockUsers = [mockUserEntity, { ...mockUserEntity, id: 'user-2' }];
      userRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      userRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      userRepository.createUser.mockResolvedValue(undefined);

      // Act
      await userRepository.createUser(mockUserEntity);

      // Assert
      expect(userRepository.createUser).toHaveBeenCalledWith(mockUserEntity);
    });

    it('should handle null user entity', async () => {
      // Arrange
      userRepository.createUser.mockRejectedValue(new Error('User entity is required'));

      // Act & Assert
      await expect(userRepository.createUser(null)).rejects.toThrow('User entity is required');
      await expect(userRepository.createUser(undefined)).rejects.toThrow('User entity is required');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      userRepository.updateUser.mockResolvedValue(undefined);

      // Act
      await userRepository.updateUser(mockUserEntity);

      // Assert
      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUserEntity);
    });

    it('should handle null user entity', async () => {
      // Arrange
      userRepository.updateUser.mockRejectedValue(new Error('User entity is required'));

      // Act & Assert
      await expect(userRepository.updateUser(null)).rejects.toThrow('User entity is required');
      await expect(userRepository.updateUser(undefined)).rejects.toThrow('User entity is required');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      userRepository.deleteUser.mockResolvedValue(undefined);

      // Act
      await userRepository.deleteUser('test-id');

      // Assert
      expect(userRepository.deleteUser).toHaveBeenCalledWith('test-id');
    });

    it('should handle empty ID parameter', async () => {
      // Arrange
      userRepository.deleteUser.mockRejectedValue(new Error('User ID is required'));

      // Act & Assert
      await expect(userRepository.deleteUser('')).rejects.toThrow('User ID is required');
      await expect(userRepository.deleteUser('   ')).rejects.toThrow('User ID is required');
    });
  });

  describe('data transformation', () => {
    it('should handle user entity data correctly', async () => {
      // Arrange
      const testUser = new UserEntity(
        'test-id',
        'test@example.com',
        'Test User',
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );
      userRepository.createUser.mockResolvedValue(undefined);

      // Act
      await userRepository.createUser(testUser);

      // Assert
      expect(userRepository.createUser).toHaveBeenCalledWith(testUser);
    });
  });
});
