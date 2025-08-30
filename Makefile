.PHONY: help build build-dev up up-dev down logs logs-app logs-db clean restart restart-dev shell shell-dev db-shell test test-docker lint format

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(GREEN)Tax Finch Docker Commands$(NC)'
	@echo '========================'
	@echo ''
	@echo '$(YELLOW)Build Commands:$(NC)'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /build/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ''
	@echo '$(YELLOW)Service Management:$(NC)'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(up|down|restart)/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ''
	@echo '$(YELLOW)Monitoring & Debugging:$(NC)'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(logs|shell|db-shell)/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ''
	@echo '$(YELLOW)Maintenance:$(NC)'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(clean|test|lint|format)/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Build Commands
build: ## Build production Docker image
	@echo "$(GREEN)Building production image...$(NC)"
	docker build --build-arg BUILD_VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev") -f docker/Dockerfile -t tax-finch:latest .

build-dev: ## Build development Docker image
	@echo "$(GREEN)Building development image...$(NC)"
	docker build -f docker/Dockerfile.dev --build-arg NODE_ENV=development -t tax-finch:dev .

build-no-cache: ## Build production image without cache
	@echo "$(YELLOW)Building production image without cache...$(NC)"
	docker build --no-cache --build-arg BUILD_VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev") -f docker/Dockerfile -t tax-finch:latest .

## Service Management
up: ## Start production services
	@echo "$(GREEN)Starting production services...$(NC)"
	docker-compose -f docker-compose.yml up -d

up-dev: ## Start development services
	@echo "$(GREEN)Starting development services...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.dev.yml down

restart: ## Restart production services
	@echo "$(YELLOW)Restarting production services...$(NC)"
	docker-compose -f docker-compose.yml restart

restart-dev: ## Restart development services
	@echo "$(YELLOW)Restarting development services...$(NC)"
	docker-compose -f docker-compose.dev.yml restart

## Monitoring & Debugging
logs: ## Show logs for all services
	docker-compose -f docker-compose.yml logs -f

logs-app: ## Show logs for application only
	docker-compose -f docker-compose.yml logs -f app

logs-db: ## Show logs for database only
	docker-compose -f docker-compose.yml logs -f postgres

logs-dev: ## Show logs for development services
	docker-compose -f docker-compose.dev.yml logs -f

shell: ## Open shell in running app container
	docker-compose -f docker-compose.yml exec app sh

shell-dev: ## Open shell in running dev app container
	docker-compose -f docker-compose.dev.yml exec app sh

db-shell: ## Open shell in database container (Production)
	docker-compose -f docker-compose.yml exec postgres psql -U postgres -d tax_finch_prod

db-shell-dev: ## Open shell in development database container
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d tax_finch_dev

## Maintenance
clean: ## Remove all containers, images, and volumes
	@echo "$(RED)Cleaning up Docker resources...$(NC)"
	docker-compose -f docker-compose.yml down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -f
	docker volume prune -f

clean-images: ## Remove all Docker images
	@echo "$(RED)Removing all Docker images...$(NC)"
	docker rmi $(docker images -q) 2>/dev/null || true

clean-volumes: ## Remove all Docker volumes
	@echo "$(RED)Removing all Docker volumes...$(NC)"
	docker volume rm $(docker volume ls -q) 2>/dev/null || true

## Testing & Quality
test: ## Run tests in Docker container
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose -f docker-compose.dev.yml exec app npm test

test-docker: ## Test Docker setup
	@echo "$(GREEN)Testing Docker setup...$(NC)"
	@docker-compose -f docker-compose.yml config > /dev/null && echo "$(GREEN)✓ Production compose file is valid$(NC)" || echo "$(RED)✗ Production compose file has errors$(NC)"
	@docker-compose -f docker-compose.dev.yml config > /dev/null && echo "$(GREEN)✓ Development compose file is valid$(NC)" || echo "$(RED)✗ Development compose file has errors$(NC)"

lint: ## Run linting in Docker container
	@echo "$(GREEN)Running linting...$(NC)"
	docker-compose -f docker-compose.dev.yml exec app npm run lint

format: ## Format code in Docker container
	@echo "$(GREEN)Formatting code...$(NC)"
	docker-compose -f docker-compose.dev.yml exec app npm run format

## Utility Commands
status: ## Show status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	docker-compose -f docker-compose.yml ps
	@echo ""
	@echo "$(GREEN)Development Service Status:$(NC)"
	docker-compose -f docker-compose.dev.yml ps

ps: status ## Alias for status

logs-follow: logs ## Alias for logs

up-build: ## Build and start production services
	@make build
	@make up

up-build-dev: ## Build and start development services
	@make build-dev
	@make up-dev
