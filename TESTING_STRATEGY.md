# Testing Strategy for Tax Finch

## Overview

This document outlines our comprehensive testing strategy that separates concerns and makes tests easily readable, maintainable, and focused.

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                          │
├─────────────────────────────────────────────────────────────┤
│  🔴 E2E Tests (Few)                                        │
│  - Complete user journeys                                  │
│  - Real database interactions                              │
│  - Slow but comprehensive                                  │
├─────────────────────────────────────────────────────────────┤
│  🟡 Integration Tests (Some)                               │
│  - Layer interactions                                      │
│  - Mocked external dependencies                            │
│  - Medium speed, good coverage                            │
├─────────────────────────────────────────────────────────────┤
│  🟢 Unit Tests (Many)                                      │
│  - Single responsibility                                   │
│  - Fully mocked dependencies                               │
│  - Fast, focused, maintainable                            │
└─────────────────────────────────────────────────────────────┘
```

## Test Categories

### 1. Unit Tests (Isolated)

**Purpose**: Test single unit of code in isolation
**Location**: `src/__tests__/unit/`
**Dependencies**: All external dependencies are mocked
**Speed**: Fast (milliseconds)
**Maintenance**: Easy to modify and debug

**Examples**:

- `UserService` tests with mocked `UserEntity` and `UserRepository`
- `UserController` tests with mocked `UserService`
- `UserEntity` tests with pure business logic

### 2. Integration Tests (Layer Interactions)

**Purpose**: Test how different layers work together
**Location**: `src/__tests__/integration/`
**Dependencies**: Some real dependencies, some mocked
**Speed**: Medium (seconds)
**Maintenance**: Moderate complexity

**Examples**:

- Service + Entity integration
- Controller + Service integration
- Repository + Database integration

### 3. End-to-End Tests (Full Flow)

**Purpose**: Test complete user journeys
**Location**: `src/__tests__/e2e/`
**Dependencies**: Real database, real services
**Speed**: Slow (tens of seconds)
**Maintenance**: Complex, requires test data setup

## Implementation Plan

### Phase 1: Unit Tests ✅ COMPLETED

- [x] Refactor `UserService` tests with mocked dependencies
- [x] Focus on service orchestration logic only
- [x] Remove entity business logic testing from service tests

### Phase 2: Controller Unit Tests ✅ COMPLETED

- [x] Create `UserController` unit tests
- [x] Mock `UserService` completely
- [x] Test only HTTP handling logic
- [x] Test request/response formatting

### Phase 3: Repository Unit Tests 📋 PLANNED

- [ ] Create `UserRepository` unit tests
- [ ] Mock database connection
- [ ] Test data transformation logic
- [ ] Test error handling

### Phase 4: Integration Tests 📋 PLANNED

- [ ] Move current integration logic to proper integration tests
- [ ] Test real layer interactions
- [ ] Use real entities with mocked external dependencies

### Phase 5: E2E Tests 📋 PLANNED

- [ ] Create full user journey tests
- [ ] Use test database
- [ ] Test complete workflows

## Test Naming Conventions

### Unit Tests

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("should create user successfully when email does not exist", async () => {
      // Test service logic only
    });

    it("should throw error when user with email already exists", async () => {
      // Test error handling
    });
  });
});
```

### Integration Tests

```typescript
describe("UserService + UserEntity Integration", () => {
  it("should create user with valid business rules", async () => {
    // Test real entity with mocked repository
  });
});
```

### E2E Tests

```typescript
describe("User Creation E2E", () => {
  it("should create user through complete system flow", async () => {
    // Test from HTTP request to database
  });
});
```

## Mock Strategy

### What to Mock

- **External Services**: Database, email services, external APIs
- **Dependencies**: Other business logic classes
- **Time-sensitive Operations**: Dates, timestamps
- **Random Operations**: UUID generation, IDs

### What NOT to Mock

- **Business Logic**: Entity validation rules
- **Data Transformation**: Simple object manipulation
- **Pure Functions**: Mathematical operations, string manipulation

## Test Data Management

### Fixtures

- **Unit Tests**: Minimal, focused test data
- **Integration Tests**: Realistic business scenarios
- **E2E Tests**: Complete user data sets

### Test Database

- **Unit Tests**: No database needed
- **Integration Tests**: In-memory or test database
- **E2E Tests**: Dedicated test database

## Benefits of This Approach

### 1. Fast Execution

- Unit tests run in milliseconds
- No external dependencies to wait for
- Parallel execution possible

### 2. Easy Debugging

- Failures are isolated to specific units
- Clear separation of concerns
- Easy to identify what broke

### 3. Maintainability

- Tests are focused and readable
- Easy to modify when business logic changes
- Clear test names describe the scenario

### 4. Reliable

- No flaky tests due to external factors
- Consistent test results
- Predictable test behavior

## Example: User Creation Flow

### Unit Test (Service Layer)

```typescript
it("should create user successfully when email does not exist", async () => {
  // Arrange
  mockRepository.findByEmail.mockResolvedValue(null);
  mockEntity.createUser.mockReturnValue(mockUser);
  mockRepository.save.mockResolvedValue(undefined);

  // Act
  const result = await userService.createUser(dto);

  // Assert
  expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
  expect(mockEntity.createUser).toHaveBeenCalled();
  expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
  expect(result).toBe(mockUser);
});
```

### Integration Test (Service + Entity)

```typescript
it("should create user with valid business rules", async () => {
  // Arrange
  const realEntity = new UserEntity();
  mockRepository.findByEmail.mockResolvedValue(null);
  mockRepository.save.mockResolvedValue(undefined);

  // Act
  const result = await userService.createUser(dto);

  // Assert
  expect(result.email).toBe(dto.email);
  expect(result.name).toBe(dto.name);
  expect(result.id).toBeDefined();
});
```

## Maintenance Guidelines

### When to Update Tests

1. **Business Logic Changes**: Update entity tests
2. **Service Flow Changes**: Update service tests
3. **API Changes**: Update controller tests
4. **Data Model Changes**: Update repository tests

### How to Update Tests

1. **Identify the Layer**: Which component changed?
2. **Update Unit Tests**: Modify tests for that specific layer
3. **Update Integration Tests**: Ensure layer interactions still work
4. **Run All Tests**: Verify no regressions

### Test Refactoring

1. **Extract Common Logic**: Create helper functions
2. **Improve Readability**: Use descriptive test names
3. **Reduce Duplication**: Share test data and mocks
4. **Maintain Focus**: Each test should test one thing

## Running Tests

### Unit Tests Only

```bash
bun test src/__tests__/unit/
```

### Integration Tests Only

```bash
bun test src/__tests__/integration/
```

### All Tests

```bash
bun test
```

### With Coverage

```bash
bun test --coverage
```

## Success Metrics

- **Test Execution Time**: Unit tests < 100ms, Integration < 1s
- **Test Coverage**: Maintain > 90% line coverage
- **Test Reliability**: 0% flaky tests
- **Maintenance Time**: < 5 minutes to add new test case
- **Debugging Time**: < 2 minutes to identify test failure cause

This testing strategy ensures our codebase is robust, maintainable, and easy to modify while providing fast feedback during development.
