# Query Engine - Advanced Pagination, Sorting & Filtering

The Query Engine provides powerful pagination, sorting, and filtering capabilities across all API endpoints with minimal developer effort.

## 🚀 Quick Start

### 1. In your Controller (just 3 lines!)

```typescript
async getAll(c: Context) {
  const queryOptions = c.get("queryOptions");
  const result = await this.userService.getUsersWithPagination(queryOptions);
  return c.json(result);
}
```

### 2. In your Repository (just 1 line!)

```typescript
async findWithPagination(options: QueryOptions): Promise<PaginatedResponse<UserEntity>> {
  const result = await runQuery(this.db, baseQuery, options);
  const data = result.data.map(row => EntityConverter.fromRow(UserEntity, row));
  return { data, pagination: result.pagination };
}
```

## 📖 API Usage Examples

### Basic Pagination

```bash
# Get first page with 20 items
GET /api/users?from_page=1&limit=20

# Get second page with 10 items
GET /api/users?from_page=2&limit=10
```

### With Sorting

```bash
# Sort by name ascending
GET /api/users?from_page=1&limit=15&ordering=name

# Sort by creation date descending
GET /api/users?from_page=1&limit=15&ordering=-createdAt
```

### With Filtering

```bash
# Filter by name containing "john"
GET /api/users?from_page=1&limit=10&name=john

# Filter by email domain
GET /api/users?from_page=1&limit=10&email=gmail
```

### Combined (everything together!)

```bash
GET /api/users?from_page=2&limit=25&ordering=-createdAt&name=john&email=gmail
```

## 🔧 How It Works

1. **Automatic Parsing**: Query Engine automatically parses all query parameters
2. **Smart Filtering**: Any parameter not used for pagination/sorting becomes a filter
3. **Page-based Pagination**: Efficient offset-based pagination with page numbers
4. **Built-in Limits**: Default 20 items per page, max 100
5. **Automatic Sorting**: Uses specified field with direction prefix

## 📊 Response Format

```json
{
  "data": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-09-01T12:00:00.000Z",
      "updatedAt": "2025-09-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "fromPage": 1,
    "toPage": 1,
    "limit": 20,
    "total": 45,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🎯 Key Benefits

- **Minimal Code**: Just 3 lines in controller, 1 line in repository
- **Automatic**: No need to specify allowed fields or validation
- **Flexible**: Works with any table schema automatically
- **Efficient**: Page-based pagination with proper offset calculation
- **Developer Friendly**: Comprehensive examples and clear parameter names

## 🔄 Adding to New Endpoints

To add pagination to any new endpoint:

1. **Controller**: Use `c.get("queryOptions")` to get parsed options
2. **Service**: Pass options to repository method
3. **Repository**: Use `runQuery()` with your base query and options

That's it! The Query Engine handles all the complexity automatically.

## 📋 Parameter Reference

### Pagination Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `from_page` | number | Starting page number (1-based) | `?from_page=1` |
| `to_page` | number | Ending page number (optional) | `?to_page=3` |
| `limit` | number | Items per page (max 100) | `?limit=25` |

### Sorting Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ordering` | string | Sort field with direction | `?ordering=name` |
| `ordering` | string | Reverse sort (descending) | `?ordering=-createdAt` |

### Filtering Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `field` | string | Filter by field value | `?name=john` |
| `field` | string | Partial match (LIKE) | `?email=gmail` |

## 🚨 Important Notes

- **Parameter Names**: Use `from_page` (not `page`) for pagination
- **Page Numbers**: Pages are 1-based (first page is 1, not 0)
- **Default Values**: Default limit is 20, max limit is 100
- **Sorting**: Use `-` prefix for descending order (e.g., `-createdAt`)
- **Filtering**: Any unknown parameter becomes a filter automatically
