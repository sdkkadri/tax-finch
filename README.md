# Tax Finch 🐦

A modern, scalable tax management application built with TypeScript, Node.js, and PostgreSQL, featuring clean architecture principles and robust dependency injection.

## 🚀 Project Overview

Tax Finch is a comprehensive tax management system designed with clean architecture principles, featuring domain-driven design, dependency injection, and modern development practices. The application provides a robust foundation for managing tax-related data with a focus on maintainability, scalability, and type safety.

## 🏗️ Architecture

### Clean Architecture Layers

```
src/
├── domain/           # Business logic & entities
├── application/      # Use cases & application services
└── infrastructure/   # External concerns (DB, APIs)
```

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Dependency Injection**: TSyringe
- **Validation**: Zod
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Bun

## 📁 Project Structure

```
tax-finch/
├── src/
│   ├── domain/                    # Domain layer
│   │   ├── entities/             # Business entities
│   │   │   ├── user.ts          # User domain entity
│   │   │   └── order.ts         # Order domain entity
│   │   ├── repositories/         # Repository interfaces
│   │   ├── services/             # Domain services
│   │   └── vo/                   # Value objects
│   ├── application/               # Application layer
│   │   ├── controller/           # HTTP controllers
│   │   ├── service/              # Application services
│   │   ├── dto/                  # Data transfer objects
│   │   └── routes/               # API route definitions
│   └── infrastructure/           # Infrastructure layer
│       ├── database/             # Database configuration
│       │   ├── schema/           # Database schemas
│       │   ├── repositories/     # Repository implementations
│       │   └── connection.ts     # Database connection
│       └── email/                # Email service (placeholder)
├── docker/                        # Docker configurations
├── drizzle/                       # Database migrations
├── data/                          # PostgreSQL data directory
└── init-scripts/                  # Database initialization
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tax-finch
   ```

2. **Create environment file**

   ```bash
   cp env.example .env
   ```

   Update `.env` with your database configuration:

   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DATABASE=tax_finch_dev
   POSTGRES_USERNAME=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_SSL=false
   DATABASE_POOL_MAX=10
   DATABASE_TIMEOUT=30000
   NODE_ENV=development
   ```

3. **Start services**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Install dependencies**

   ```bash
   bun install
   ```

5. **Run the application**
   ```bash
   bun run dev
   ```

The application will be available at `http://localhost:3001`

## 🗄️ Database

### Schema Overview

- **Users**: User management with email uniqueness
- **Orders**: Order tracking and management
- **Order Statuses**: Status workflow management
- **Items**: Order item details

### Migrations

Database migrations are managed with Drizzle ORM:

```bash
# Generate migration
bun run drizzle-kit generate

# Apply migrations
bun run drizzle-kit push
```

## 📡 API Endpoints

### User Management

| Method   | Endpoint         | Description     | Request Body                              |
| -------- | ---------------- | --------------- | ----------------------------------------- |
| `GET`    | `/api/users`     | Get all users   | -                                         |
| `GET`    | `/api/users/:id` | Get user by ID  | -                                         |
| `POST`   | `/api/users`     | Create new user | `{ "name": "string", "email": "string" }` |
| `PUT`    | `/api/users/:id` | Update user     | `{ "name": "string" }`                    |
| `DELETE` | `/api/users/:id` | Delete user     | -                                         |

### Example Usage

```bash
# Create a user
curl --request POST \
  --url http://localhost:3001/api/users \
  --header 'content-type: application/json' \
  --data '{"name":"John Doe","email":"john@example.com"}'

# Get all users
curl http://localhost:3001/api/users

# Get user by ID
curl http://localhost:3001/api/users/USER_ID_HERE
```

## 🏗️ Development

### Architecture Principles

1. **Clean Architecture**: Separation of concerns between layers
2. **Domain-Driven Design**: Business logic in domain layer
3. **Dependency Injection**: Loose coupling with TSyringe
4. **Repository Pattern**: Data access abstraction
5. **DTO Pattern**: Data transfer object validation

### Code Organization

- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Orchestrates domain objects, handles use cases
- **Infrastructure Layer**: External concerns (database, APIs, etc.)

### Adding New Features

1. **Define domain entities** in `src/domain/entities/`
2. **Create repository interfaces** in `src/domain/repositories/`
3. **Implement repositories** in `src/infrastructure/database/repositories/`
4. **Add application services** in `src/application/service/`
5. **Create controllers** in `src/application/controller/`
6. **Define routes** in `src/application/routes/`
7. **Add database schema** in `src/infrastructure/database/schema/`

## 🐳 Docker

### Development Environment

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build
```

### Service Configuration

- **App**: Node.js application on port 3001
- **PostgreSQL**: Database service on port 5433 (mapped from internal 5432)
- **Network**: Isolated `tax-finch-network` for service communication

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test user.service.test.ts
```

### Test Structure

- Unit tests for domain logic
- Integration tests for repositories
- API tests for endpoints

## 📊 Database Management

### Connection Details

- **Host**: `localhost` (development) / `finch-postgres` (Docker)
- **Port**: `5432` (internal) / `5433` (external)
- **Database**: `tax_finch_dev`
- **Username**: `postgres`
- **Password**: `password`

### Data Persistence

Database data is persisted in `./data/postgres-dev/` directory, ensuring data survives container restarts.

## 🔧 Configuration

### Environment Variables

| Variable            | Description        | Default         |
| ------------------- | ------------------ | --------------- |
| `POSTGRES_HOST`     | Database host      | `localhost`     |
| `POSTGRES_PORT`     | Database port      | `5432`          |
| `POSTGRES_DATABASE` | Database name      | `tax_finch_dev` |
| `POSTGRES_USERNAME` | Database user      | `postgres`      |
| `POSTGRES_PASSWORD` | Database password  | `password`      |
| `POSTGRES_SSL`      | Enable SSL         | `false`         |
| `DATABASE_POOL_MAX` | Max connections    | `10`            |
| `DATABASE_TIMEOUT`  | Connection timeout | `30000`         |
| `NODE_ENV`          | Environment        | `development`   |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use proper production values
2. **SSL**: Enable PostgreSQL SSL in production
3. **Connection Pooling**: Adjust pool settings for production load
4. **Health Checks**: Implement proper health monitoring
5. **Logging**: Configure production logging levels

### Docker Production

```bash
# Build production image
docker build -f docker/Dockerfile -t tax-finch:latest .

# Run production container
docker run -d -p 3000:3000 --env-file .env.prod tax-finch:latest
```

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add tests for new functionality
5. Update documentation as needed

## 📝 License

[Add your license information here]

## 🆘 Support

For questions or issues:

- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Tax Finch** - Building the future of tax management, one clean architecture at a time! 🐦✨
