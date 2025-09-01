# Query Engine with User Orders - Complete Example

This document demonstrates how the enhanced `findUserOrdersWithPagination` method works with the global query engine to provide user details along with orders.

## 🎯 What We've Built

### 1. **Enhanced OrderRepository Methods**

```typescript
// Get all orders with user details (for admin/overview)
async findOrdersWithUserDetails(options: QueryOptions): Promise<any>

// Get orders for a specific user with user details
async findUserOrdersWithPagination(userId: string, options: QueryOptions): Promise<any>
```

### 2. **How It Works**

Both methods now:

- ✅ Join orders with users table
- ✅ Include user details (name, email) with each order
- ✅ Support full query engine features (pagination, sorting, filtering)
- ✅ Return enriched data structure

## 🚀 Usage Examples

### **Example 1: Get All Orders with User Details**

```bash
# Basic pagination
GET /api/orders?from_page=1&limit=10

# With sorting
GET /api/orders?ordering=-createdAt&limit=5

# With filtering
GET /api/orders?status=pending&limit=20

# Combined query
GET /api/orders?from_page=2&limit=15&ordering=total&status=confirmed
```

**Response Structure:**

```json
{
  "data": [
    {
      "id": "order123",
      "userId": "user456",
      "items": [...],
      "status": "pending",
      "total": "99.99",
      "createdAt": "2025-08-31T18:24:17.315Z",
      "updatedAt": "2025-08-31T18:24:17.315Z",
      "user": {
        "id": "user456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "fromPage": 1,
    "toPage": 1,
    "limit": 10,
    "total": "25",
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **Example 2: Get User-Specific Orders with User Details**

```bash
# Get orders for user "user456" with pagination
GET /api/orders/user/user456/paginated?from_page=1&limit=5

# With sorting
GET /api/orders/user/user456/paginated?ordering=-createdAt&limit=10

# With filtering
GET /api/orders/user/user456/paginated?status=pending&limit=20

# Combined query
GET /api/orders/user/user456/paginated?from_page=1&limit=15&ordering=total&status=confirmed
```

**Response Structure:**

```json
{
  "data": [
    {
      "id": "order123",
      "userId": "user456",
      "items": [...],
      "status": "pending",
      "total": "99.99",
      "createdAt": "2025-08-31T18:24:17.315Z",
      "updatedAt": "2025-08-31T18:24:17.315Z",
      "user": {
        "id": "user456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "fromPage": 1,
    "toPage": 1,
    "limit": 5,
    "total": "12",
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔧 Implementation Details

### **Database Query Structure**

```typescript
const baseQuery = this.db
  .select({
    // Order fields
    id: ordersTable.id,
    userId: ordersTable.userId,
    items: ordersTable.items,
    status: ordersTable.status,
    total: ordersTable.total,
    createdAt: ordersTable.createdAt,
    updatedAt: ordersTable.updatedAt,
    // User fields
    userName: usersTable.name,
    userEmail: usersTable.email,
  })
  .from(ordersTable)
  .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
  .where(eq(ordersTable.userId, userId)); // Only for user-specific queries
```

### **Data Transformation**

```typescript
const data = result.data.map((row: any) => {
  const order = EntityConverter.fromRow(OrderEntity, row);
  return {
    ...order,
    user: {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
    },
  };
});
```

## 📊 Benefits

### **1. Complete Context**

- Orders now include user information
- No need for additional API calls to get user details
- Better user experience in frontend applications

### **2. Efficient Queries**

- Single database query instead of multiple
- Proper JOIN optimization
- Reduced network round trips

### **3. Flexible Filtering**

- Filter orders by user properties (name, email)
- Sort by user properties
- Maintain all existing query engine features

### **4. Consistent API**

- Same response structure across all endpoints
- Unified pagination, sorting, and filtering
- Easy to consume in frontend applications

## 🎯 Use Cases

### **Admin Dashboard**

```bash
# Get all orders with user details for admin overview
GET /api/orders?from_page=1&limit=50&ordering=-createdAt
```

### **User Profile Page**

```bash
# Get user's order history with pagination
GET /api/orders/user/user456/paginated?from_page=1&limit=20&ordering=-createdAt
```

### **Customer Support**

```bash
# Get orders for specific user with filtering
GET /api/orders/user/user456/paginated?status=pending&limit=100
```

### **Analytics**

```bash
# Get orders with user details for reporting
GET /api/orders?from_page=1&limit=1000&ordering=total
```

## 🔄 Migration Path

### **Before (Old System)**

```typescript
// Get orders
const orders = await orderRepository.findByUserId(userId);

// Get user details separately
const user = await userRepository.findById(userId);

// Combine manually
const result = orders.map((order) => ({ ...order, user }));
```

### **After (New System)**

```typescript
// Get orders with user details in one call
const result = await orderRepository.findUserOrdersWithPagination(
  userId,
  options
);
// result.data already includes user details
```

## 🚀 Next Steps

1. **Test the new endpoints** with real data
2. **Add more user fields** if needed (phone, address, etc.)
3. **Implement caching** for frequently accessed user data
4. **Add user search** capabilities to order filtering
5. **Extend to other entities** (items, categories, etc.)

The enhanced query engine now provides a complete, efficient, and user-friendly way to work with orders and user data! 🎉
