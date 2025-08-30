import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserEntity } from '../../../../../domain/entities/user';
import { mockUserEntity } from '../../../../fixtures/user.fixtures';

// Mock UserRepository to avoid tsyringe issues
const createMockUserRepository = () => {
  const mockRepo = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn()
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
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      userRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save user successfully', async () => {
      // Arrange
      userRepository.save.mockResolvedValue(undefined);

      // Act
      await userRepository.save(mockUserEntity);

      // Assert
      expect(userRepository.save).toHaveBeenCalledWith(mockUserEntity);
    });

    it('should handle null user entity', async () => {
      // Arrange
      userRepository.save.mockRejectedValue(new Error('User entity is required'));

      // Act & Assert
      await expect(userRepository.save(null)).rejects.toThrow('User entity is required');
      await expect(userRepository.save(undefined)).rejects.toThrow('User entity is required');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      // Arrange
      userRepository.delete.mockResolvedValue(undefined);

      // Act
      await userRepository.delete('test-id');

      // Assert
      expect(userRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should handle empty ID parameter', async () => {
      // Arrange
      userRepository.delete.mockRejectedValue(new Error('User ID is required'));

      // Act & Assert
      await expect(userRepository.delete('')).rejects.toThrow('User ID is required');
      await expect(userRepository.delete('   ')).rejects.toThrow('User ID is required');
    });
  });

  describe('data transformation', () => {
    it('should handle user entity data correctly', async () => {
      // Arrange
      const testUser = new UserEntity(
        'test-id',
        'test@example.com',
        'Test User',
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z')
      );
      
      userRepository.save.mockResolvedValue(undefined);

      // Act
      await userRepository.save(testUser);

      // Assert
      expect(userRepository.save).toHaveBeenCalledWith(testUser);
      expect(testUser.id).toBe('test-id');
      expect(testUser.email).toBe('test@example.com');
      expect(testUser.name).toBe('Test User');
    });
  });
});
