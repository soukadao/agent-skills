---
name: test-writer
description: Assists with writing and reviewing test code. Use when writing tests or improving test code. Emphasizes behavior verification, boundary testing, and error case coverage.
---

# Test Writer Skill

## Overview

This skill supports creating high-quality test code based on the following principles:

1. **Behavior Verification** - Test behavior, not implementation details
2. **Boundaries and Error Cases** - Cover not only happy paths, but also edge cases and error cases
3. **Reproducibility and Independence** - Tests always return the same results and don't depend on other tests
4. **One Test, One Aspect** - Each test verifies only one aspect
5. **Failure Information** - When a test fails, the cause is immediately clear
6. **Alignment with Testable Design** - Promote designs that consider testability
7. **Deletability** - Tests can be deleted without hesitation when no longer needed

## Test Creation Guidelines

### 1. Test Naming Conventions

Test names should make it clear what is being tested:

```typescript
// Good example
describe('User.authenticate', () => {
  it('succeeds authentication with correct password', () => {})
  it('fails authentication with wrong password', () => {})
  it('returns validation error with empty password', () => {})
})

// Bad example
describe('User', () => {
  it('test1', () => {})
  it('should work', () => {})
})
```

### 2. AAA Pattern (Arrange-Act-Assert)

Tests should be divided into three clear sections:

```typescript
it('updates total amount when adding product to cart', () => {
  // Arrange: Prepare test
  const cart = new Cart()
  const product = { id: '1', price: 1000 }

  // Act: Execute operation under test
  cart.add(product)

  // Assert: Verify result
  expect(cart.total).toBe(1000)
})
```

### 3. Boundary and Error Case Testing

Test not only happy paths, but also these cases:

```typescript
describe('get maximum value from array', () => {
  it('returns max value for array with only positive numbers', () => {
    expect(max([1, 2, 3])).toBe(3)
  })

  it('returns max value for array containing negative numbers', () => {
    expect(max([-1, -2, -3])).toBe(-1)
  })

  it('returns the value for single element array', () => {
    expect(max([5])).toBe(5)
  })

  it('throws error for empty array', () => {
    expect(() => max([])).toThrow('Array is empty')
  })

  it('throws error for array containing non-numbers', () => {
    expect(() => max([1, 'a', 3])).toThrow('Contains non-numeric values')
  })
})
```

### 4. Test Independence

Each test should be independently executable:

```typescript
// Good example
describe('UserRepository', () => {
  let repository: UserRepository

  beforeEach(() => {
    repository = new UserRepository()
  })

  it('can create user', () => {
    const user = repository.create({ name: 'Alice' })
    expect(user.name).toBe('Alice')
  })

  it('can find user', () => {
    const user = repository.create({ name: 'Bob' })
    const found = repository.findById(user.id)
    expect(found).toEqual(user)
  })
})

// Bad example (tests depend on execution order)
describe('UserRepository', () => {
  let userId: string

  it('can create user', () => {
    const user = repository.create({ name: 'Alice' })
    userId = user.id // Used in next test
  })

  it('can find user', () => {
    const found = repository.findById(userId) // Depends on previous test
    expect(found.name).toBe('Alice')
  })
})
```

### 5. Using Mocks and Stubs

Mock external dependencies appropriately:

```typescript
import { vi } from 'vitest'

describe('OrderService', () => {
  it('decreases inventory when order is placed', async () => {
    // Arrange: Mock dependencies
    const mockInventory = {
      decrease: vi.fn().mockResolvedValue(true)
    }
    const service = new OrderService(mockInventory)

    // Act
    await service.placeOrder({ productId: '1', quantity: 2 })

    // Assert
    expect(mockInventory.decrease).toHaveBeenCalledWith('1', 2)
  })
})
```

### 6. Clear Failure Messages

When a test fails, make it immediately clear what the problem is:

```typescript
// Good example
it('username should be 20 characters or less', () => {
  const longName = 'a'.repeat(21)
  const result = validateUsername(longName)
  expect(result.isValid).toBe(false)
  expect(result.error).toBe('Username must be 20 characters or less')
})

// Bad example
it('validation', () => {
  expect(validate('x')).toBe(false) // Why did it fail?
})
```

### 7. Test Data Management

Manage test data with factories or builder patterns:

```typescript
// Test data factory
function createTestUser(overrides = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }
}

describe('UserService', () => {
  it('only admins can delete', () => {
    const admin = createTestUser({ role: 'admin' })
    const result = service.canDelete(admin)
    expect(result).toBe(true)
  })

  it('regular users cannot delete', () => {
    const user = createTestUser({ role: 'user' })
    const result = service.canDelete(user)
    expect(result).toBe(false)
  })
})
```

## Recommended Test Framework for TypeScript/Node.js

This project uses the following tools:

- **Test Runner**: Vitest
- **Assertion Library**: Built-in (expect)
- **Mock Library**: vi.fn()
- **Coverage Tool**: Vitest built-in coverage

## Test File Placement

```
src/
  user/
    user.ts
    user.test.ts  # Same directory as implementation
  cart/
    cart.ts
    cart.test.ts
```

Or

```
src/
  user/
    user.ts
tests/
  user/
    user.test.ts  # Consolidated in tests directory
```

## Coverage

Measure coverage with Vitest's built-in tool:

```bash
vitest run --coverage
```

**Coverage Policy**:
- **C0 (Statement Coverage)**: 100% - Execute all code lines
- **C1 (Branch Coverage)**: 100% - Execute all conditional branches
- **Simple getter/setter**: No test needed (from deletability perspective)

## Anti-patterns

Patterns to avoid:

1. **Testing implementation details**
   ```typescript
   // Bad example
   it('uses internal cache map', () => {
     expect(service._cache instanceof Map).toBe(true)
   })
   ```

2. **Verifying multiple aspects in one test**
   ```typescript
   // Bad example
   it('user functionality', () => {
     expect(user.create()).toBeTruthy()
     expect(user.update()).toBeTruthy()
     expect(user.delete()).toBeTruthy()
   })
   ```

3. **Sharing state between tests**
   ```typescript
   // Bad example
   let sharedState = {}
   it('test1', () => { sharedState.value = 1 })
   it('test2', () => { expect(sharedState.value).toBe(1) })
   ```
