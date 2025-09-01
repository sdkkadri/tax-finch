# Dependency Injection Alignment Guide

This guide explains the Dependency Injection (DI) architecture and alignment in Tax Finch, including recent improvements and best practices.

## 🎯 Overview

Tax Finch uses **interface-based dependency injection** to ensure loose coupling, testability, and maintainability. Our DI system automatically registers all classes and provides proper interface injection throughout the application.

## 🏗️ Architecture Principles

### 1. Interface-First Design
- **Domain interfaces** define contracts
- **Concrete implementations** live in infrastructure layer
- **Services depend on interfaces**, not concrete classes

### 2. Token-Based Registration
- **Symbol tokens** for each interface
- **Automatic registration** with interface tokens
- **Type-safe injection** throughout the system

### 3. Clean Architecture Compliance
- **Domain layer**: Pure business logic, no external dependencies
- **Application layer**: Orchestrates domain objects
- **Infrastructure layer**: Implements interfaces

## 🔧 Implementation Details

### Repository Interface Definition

```typescript
// src/domain/repositories/iuser.repository.ts
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findWithPagination(options: QueryOptions): Promise<any>;
  createUser(user: UserEntity): Promise<void>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

// Token for DI registration
export const IUserRepository = Symbol("IUserRepository");
```

### Repository Implementation

```typescript
// src/infrastructure/database/repositories/UserRepository.ts
@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject("Database") private db: Database
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    // Implementation
  }
  
  // ... other methods
}
```

### Service Injection

```typescript
// src/application/service/user.service.ts
@injectable()
export class UserService {
  constructor(
    @inject(IUserRepository) private userRepository: IUserRepository
  ) {}

  async createUser(dto: CreateUserDTOType): Promise<UserEntity> {
    // Business logic using injected repository
  }
}
```

### Container Registration

```typescript
// src/infrastructure/di/auto-container.ts
import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";

// Register repositories with interface tokens
container.registerSingleton(IUserRepository, UserRepository);
container.registerSingleton(IOrderRepository, OrderRepository);
```

## 📋 DI Registration Pattern

### For Repositories
```typescript
// ✅ CORRECT: Register with interface token
container.registerSingleton(IUserRepository, UserRepository);

// ❌ WRONG: Register concrete class directly
container.registerSingleton(UserRepository);
```

### For Other Classes
```typescript
// ✅ CORRECT: Register concrete classes directly
container.registerSingleton(UserController);
container.registerSingleton(UserService);
container.registerSingleton(UserEntity);
```

## 🚀 Benefits of Interface Injection

### 1. **Testability**
```typescript
// Easy to mock for unit tests
const mockUserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  // ... other methods
};

// Inject mock in tests
const userService = new UserService(mockUserRepository);
```

### 2. **Extensibility**
```typescript
// Can easily swap implementations
class MockUserRepository implements IUserRepository {
  // Mock implementation for testing
}

class CachedUserRepository implements IUserRepository {
  // Cached implementation for performance
}

// Register different implementations as needed
container.registerSingleton(IUserRepository, MockUserRepository);
```

### 3. **Loose Coupling**
- Services don't know about concrete implementations
- Easy to change database providers
- Simple to add caching layers
- Clean separation of concerns

## 🔍 Troubleshooting

### Common Issues

#### 1. **"Cannot resolve dependency" Error**
```bash
Error: Cannot resolve dependency: Symbol(IUserRepository)
```

**Solution**: Ensure the interface token is properly exported and imported:
```typescript
// Check export in interface file
export const IUserRepository = Symbol("IUserRepository");

// Check import in service
import { IUserRepository } from "../../domain/repositories/iuser.repository";
```

#### 2. **"Interface cannot be used as value" Error**
```bash
Error: 'IUserRepository' only refers to a type, but is being used as a value here.
```

**Solution**: Import the token, not the interface type:
```typescript
// ✅ CORRECT: Import the token
import { IUserRepository } from "../../domain/repositories/iuser.repository";

// ❌ WRONG: Import as type
import type { IUserRepository } from "../../domain/repositories/iuser.repository";
```

#### 3. **Container Registration Issues**
```bash
Error: No registration found for Symbol(IUserRepository)
```

**Solution**: Check container registration:
```typescript
// Ensure this is in auto-container.ts
container.registerSingleton(IUserRepository, UserRepository);
```

### Debug Commands

```bash
# Check container logs
docker logs tax-finch-app-1 | grep "container"

# Verify registration
docker exec tax-finch-app-1 cat /app/src/infrastructure/di/auto-container.ts

# Check for DI errors
docker logs tax-finch-app-1 2>&1 | grep -i "dependency\|inject"
```

## 📚 Best Practices

### 1. **Always Use Interfaces for Repositories**
```typescript
// ✅ GOOD: Interface-based injection
constructor(@inject(IUserRepository) private userRepository: IUserRepository) {}

// ❌ AVOID: Concrete class injection
constructor(@inject(UserRepository) private userRepository: UserRepository) {}
```

### 2. **Keep Interfaces in Domain Layer**
```typescript
// ✅ GOOD: Interface in domain layer
src/domain/repositories/iuser.repository.ts

// ❌ AVOID: Interface in infrastructure layer
src/infrastructure/database/repositories/iuser.repository.ts
```

### 3. **Use Descriptive Token Names**
```typescript
// ✅ GOOD: Clear, descriptive names
export const IUserRepository = Symbol("IUserRepository");
export const IOrderRepository = Symbol("IOrderRepository");

// ❌ AVOID: Generic names
export const IRepo = Symbol("IRepo");
```

### 4. **Implement All Interface Methods**
```typescript
@injectable()
export class UserRepository implements IUserRepository {
  // ✅ MUST implement ALL interface methods
  async findById(id: string): Promise<UserEntity | null> { /* ... */ }
  async findByEmail(email: string): Promise<UserEntity | null> { /* ... */ }
  // ... all other methods
}
```

## 🔄 Migration Guide

### From Concrete Injection to Interface Injection

#### Before (Old Pattern)
```typescript
// Service
constructor(@inject(UserRepository) private userRepository: UserRepository) {}

// Container
container.registerSingleton(UserRepository);
```

#### After (New Pattern)
```typescript
// Service
constructor(@inject(IUserRepository) private userRepository: IUserRepository) {}

// Container
container.registerSingleton(IUserRepository, UserRepository);
```

### Steps to Migrate

1. **Ensure interface exists** with all required methods
2. **Export token** from interface file
3. **Update service constructor** to inject by interface
4. **Update container registration** to use interface token
5. **Test thoroughly** to ensure DI resolution works
6. **Update imports** to include token (not just type)

## 📊 Current Status

### ✅ **Completed**
- User repository interface injection
- Order repository interface injection
- Container registration with interface tokens
- Service injection by interface
- Auto-discovery system working

### 🔄 **In Progress**
- Additional repository interfaces as needed
- Service interface definitions (if required)
- Advanced DI patterns for complex scenarios

### 📋 **Future Considerations**
- Service layer interfaces for complex business logic
- Factory pattern integration
- Advanced scoping (request-scoped, transient)
- Performance monitoring and optimization

## 🎉 Summary

Our DI alignment ensures:
- **Clean architecture** compliance
- **Easy testing** with mock implementations
- **Loose coupling** between layers
- **Type safety** throughout the system
- **Maintainable** and **extensible** codebase

The interface-based injection pattern provides the foundation for a robust, testable, and maintainable application architecture.
