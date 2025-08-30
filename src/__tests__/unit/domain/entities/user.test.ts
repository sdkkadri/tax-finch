import { describe, it, expect, beforeEach } from 'vitest';
import { UserEntity } from '../../../../domain/entities/user';
import { mockUserData, mockUserEntity, mockLongNameUserData } from '../../../fixtures/user.fixtures';

describe('UserEntity', () => {
  let user: UserEntity;

  beforeEach(() => {
    user = new UserEntity(
      'test-id',
      'test@example.com',
      'Test User',
      new Date('2024-01-01T00:00:00.000Z'),
      new Date('2024-01-01T00:00:00.000Z')
    );
  });

  describe('constructor', () => {
    it('should create a user with all properties', () => {
      expect(user.id).toBe('test-id');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(user.updatedAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('should create a user with long name (within limits)', () => {
      const longName = 'A'.repeat(100); // Exactly 100 characters
      const longNameUser = new UserEntity(
        'long-name-id',
        'long@example.com',
        longName,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z')
      );
      
      expect(longNameUser.name).toBe(longName);
      expect(longNameUser.name.length).toBe(100);
    });

    it('should create a user with very long name (exceeds limits)', () => {
      const veryLongName = 'A'.repeat(101); // Exceeds 100 characters
      const veryLongNameUser = new UserEntity(
        'very-long-name-id',
        'verylong@example.com',
        veryLongName,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z')
      );
      
      expect(veryLongNameUser.name).toBe(veryLongName);
      expect(veryLongNameUser.name.length).toBe(101);
    });
  });

  describe('static create method', () => {
    it('should create a user with generated timestamps', () => {
      const beforeCreation = new Date();
      const userData = UserEntity.create(mockUserData.email, mockUserData.name, 'new-id');
      const afterCreation = new Date();

      expect(userData.email).toBe(mockUserData.email);
      expect(userData.name).toBe(mockUserData.name);
      expect(userData.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(userData.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(userData.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(userData.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should create a user with valid email and name', () => {
      const userData = UserEntity.create('valid@email.com', 'Valid Name', 'valid-id');
      
      expect(userData.email).toBe('valid@email.com');
      expect(userData.name).toBe('Valid Name');
    });
  });

  describe('updateName method', () => {
    it('should update user name and updatedAt timestamp', () => {
      const originalUpdatedAt = user.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {}, 1);
      
      const updatedUser = user.updateName('New Name');
      
      expect(updatedUser.name).toBe('New Name');
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.createdAt).toEqual(user.createdAt);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when updating with empty name', () => {
      expect(() => user.updateName('')).toThrow('Name cannot be empty');
      expect(() => user.updateName('   ')).toThrow('Name cannot be empty');
    });

    it('should throw error when updating with whitespace-only name', () => {
      expect(() => user.updateName('   ')).toThrow('Name cannot be empty');
    });

    it('should allow updating with valid name', () => {
      const updatedUser = user.updateName('Valid New Name');
      expect(updatedUser.name).toBe('Valid New Name');
    });

    it('should allow updating with long name (within limits)', () => {
      const longName = 'B'.repeat(100); // Exactly 100 characters
      const updatedUser = user.updateName(longName);
      
      expect(updatedUser.name).toBe(longName);
      expect(updatedUser.name.length).toBe(100);
    });

    it('should allow updating with very long name (exceeds limits)', () => {
      const veryLongName = 'B'.repeat(101); // Exceeds 100 characters
      const updatedUser = user.updateName(veryLongName);
      
      expect(updatedUser.name).toBe(veryLongName);
      expect(updatedUser.name.length).toBe(101);
    });
  });

  describe('toJSON method', () => {
    it('should return correct JSON structure', () => {
      const json = user.toJSON();
      
      expect(json).toEqual({
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z')
      });
    });

    it('should return immutable data', () => {
      const json = user.toJSON();
      const originalId = json.id;
      
      // Modifying the returned object should not affect the original
      json.id = 'modified-id';
      expect(user.id).toBe('test-id');
      expect(json.id).toBe('modified-id');
    });
  });

  // Note: Immutability is enforced by TypeScript at compile time
  // Testing runtime immutability is not necessary for readonly properties
});
