# QueryHelper - Simple Pagination, Sorting & Filtering

The QueryHelper makes it incredibly easy to add pagination, sorting, and filtering to your API endpoints with minimal developer effort.

## 🚀 Quick Start

### 1. In your Controller (just 3 lines!)

```typescript
async getAll(c: Context) {
  const queryParams = new URLSearchParams(c.req.query() as Record<string, string>);
  const queryOptions = parseQueryParams(queryParams);
  const result = await this.userService.getUsersWithPagination(queryOptions);
  return c.json(result);
}
```

### 2. In your Repository (just 1 line!)

```typescript
async findWithPagination(options: QueryOptions): Promise<PaginatedResponse<UserEntity>> {
  const result = await paginate(this.db, usersTable, 'id', options);
  const data = result.data.map(row => EntityConverter.fromRow(UserEntity, row));
  return { data, pagination: result.pagination };
}
```

## 📖 API Usage Examples

### Basic Pagination

```bash
GET /users?limit=20
```

### With Cursor (for next page)

```bash
GET /users?limit=20&cursor=abc123
```

### With Sorting

```bash
GET /users?sortBy=name&order=desc&limit=15
```

### With Filtering

```bash
GET /users?name=john&email=gmail&limit=10
```

### Combined (everything together!)

```bash
GET /users?limit=25&cursor=xyz789&sortBy=createdAt&order=desc&name=john&email=gmail
```

## 🔧 How It Works

1. **Automatic Parsing**: QueryHelper automatically parses all query parameters
2. **Smart Filtering**: Any parameter not used for pagination/sorting becomes a filter
3. **Cursor-based Pagination**: More efficient than offset-based pagination
4. **Built-in Limits**: Default 10 items per page, max 100
5. **Automatic Sorting**: Uses cursor field as default sort if no sort specified

## 📊 Response Format

```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "nextCursor": "abc123",
    "prevCursor": null,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🎯 Key Benefits

- **Minimal Code**: Just 3 lines in controller, 1 line in repository
- **Automatic**: No need to specify allowed fields or validation
- **Flexible**: Works with any table schema automatically
- **Efficient**: Cursor-based pagination for better performance
- **Developer Friendly**: Comprehensive JSDoc and examples

## 🔄 Adding to New Endpoints

To add pagination to any new endpoint:

1. **Controller**: Use `parseQueryParams()` to parse options
2. **Service**: Pass options to repository method
3. **Repository**: Use `paginate()` with your table and cursor field

That's it! The QueryHelper handles all the complexity automatically.
