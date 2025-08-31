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
6. **Auto-Discovery**: Automatic dependency registration and management

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
8. **Register with auto-discovery** (see Dependency Injection section below)

## 🔧 Dependency Injection & Auto-Discovery

### Overview

Tax Finch uses a sophisticated auto-discovery system for dependency injection that automatically registers all classes as singletons, eliminating the need for manual container management. This system scales efficiently from small applications to enterprise-level projects with 30+ classes.

### Container Architecture

```
src/infrastructure/di/
├── container.ts                    # Main orchestrator
├── auto-container.ts               # Auto-generated container (main)
├── application.container.ts        # Application layer registrations
├── infrastructure.container.ts     # Infrastructure layer registrations
├── domain.container.ts             # Domain layer registrations
├── database.container.ts           # Database registrations
└── auto-discovery.ts               # Auto-discovery utilities
```

### How It Works

1. **Class Discovery**: The system automatically discovers all classes across layers
2. **Layer Classification**: Classes are automatically categorized by architectural layer
3. **Singleton Registration**: All classes are registered as singletons for optimal performance
4. **Auto-Generation**: Container files are automatically generated and updated

### Adding New Classes

#### Option 1: Auto-Discovery (Recommended for 30+ classes)

1. **Create your new class** with proper decorators:

   ```typescript
   import { inject, injectable } from "tsyringe";

   @injectable()
   export class ProductController {
     // Your controller implementation
   }
   ```

2. **Add to auto-discovery script** in `scripts/auto-discover.ts`:

   ```typescript
   { name: 'ProductController', file: 'application/controller/product.controller.ts', layer: 'application', type: 'controller' }
   ```

3. **Regenerate containers**:

   ```bash
   # From host machine
   docker exec tax-finch-app-1 npm run auto:discover

   # Or from inside container
   docker exec -it tax-finch-app-1 bash
   npm run auto:discover
   ```

4. **Restart the application**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart app
   ```

#### Option 2: Manual Registration (For small projects)

1. **Add to appropriate container file**:

   ```typescript
   // In src/infrastructure/di/application.container.ts
   import { ProductController } from "../../application/controller/product.controller";
   container.registerSingleton(ProductController);
   ```

2. **Restart the application**

### Auto-Discovery Commands

```bash
# Generate all containers automatically
npm run auto:discover

# View generated containers
ls src/infrastructure/di/

# Check container logs
docker logs tax-finch-app-1 | grep "container"
```

### Container Statistics

The system automatically tracks and reports:

- **Total classes registered**
- **Classes by layer** (Application, Infrastructure, Domain)
- **Classes by type** (Controller, Service, Repository, Entity)
- **Registration status** and any errors

### Benefits

✅ **Scalable**: Handles 30+ classes efficiently  
✅ **Maintainable**: No manual container management  
✅ **Performance**: Singleton registration prevents per-request DI resolution  
✅ **Organized**: Automatic layer-based organization  
✅ **Docker-Compatible**: Works seamlessly in containerized environments  
✅ **Error-Free**: Automatic validation and error reporting

### Troubleshooting

#### Common Issues

1. **Import Errors**: Ensure class names match exactly in auto-discovery script
2. **Interface Registration**: Only actual classes can be registered (not interfaces)
3. **Path Issues**: Verify file paths in auto-discovery script
4. **Container Restart**: Always restart after regenerating containers

#### Debug Commands

```bash
# Check container status
docker logs tax-finch-app-1 --tail 20

# Verify auto-container generation
docker exec tax-finch-app-1 cat /app/src/infrastructure/di/auto-container.ts

# Check for errors
docker logs tax-finch-app-1 2>&1 | grep -i error
```

## 🐳 Docker

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

## 📜 Scripts

### Available Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                 # Build for production
npm run start                 # Start production server

# Database
npm run db:generate          # Generate database migrations
npm run db:migrate           # Run database migrations
npm run db:push              # Push schema changes to database
npm run db:studio            # Open Drizzle Studio

# Testing
npm run test                 # Run all tests
npm run test:coverage        # Run tests with coverage
npm run test:watch           # Run tests in watch mode

# Dependency Injection
npm run auto:discover        # Auto-generate DI containers
npm run generate:containers  # Generate container files (legacy)
```

### Auto-Discovery Script

The `auto:discover` script automatically:

- Discovers all classes across the application
- Categorizes them by architectural layer
- Generates optimized container files
- Registers all classes as singletons
- Provides detailed statistics and reporting

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

### Current Auto-Discovery Status

As of the latest update, the auto-discovery system has successfully registered **8 classes** across all architectural layers:

#### 📊 Class Distribution

- **Application Layer (4)**: UserController, UserService, ItemController, OrderService
- **Infrastructure Layer (2)**: UserRepository, OrderRepository
- **Domain Layer (2)**: UserEntity, OrderEntity

#### 🔄 Auto-Generated Files

- `auto-container.ts` - Main container with all 8 classes
- `application.container.ts` - Application layer registrations
- `infrastructure.container.ts` - Infrastructure layer registrations
- `domain.container.ts` - Domain layer registrations

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
