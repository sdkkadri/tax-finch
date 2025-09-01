// Auto-generated container with 9 classes
// Generated on: 2025-08-31T18:24:46.601Z
// Do not edit manually - run 'npm run auto:discover' to regenerate

import "reflect-metadata";
import { container } from "tsyringe";

// Auto-registered classes
import { UserController } from "../../application/controller/user.controller";
import { UserService } from "../../application/service/user.service";
import { ItemController } from "../../application/controller/item.controller";
import { OrderController } from "../../application/controller/order.controller";
import { OrderService } from "../../application/service/order.service";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { OrderRepository } from "../../infrastructure/database/repositories/OrderRepository";
import { UserEntity } from "../../domain/entities/user";
import { OrderEntity } from "../../domain/entities/order";
import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { IOrderRepository } from "../../domain/repositories/iorder.repository";

// Register all classes as singletons
container.registerSingleton(UserController);
container.registerSingleton(UserService);
container.registerSingleton(ItemController);
container.registerSingleton(OrderController);
container.registerSingleton(OrderService);
container.registerSingleton(UserEntity);
container.registerSingleton(OrderEntity);

// Register repositories with interface tokens
container.registerSingleton(IUserRepository, UserRepository);
container.registerSingleton(IOrderRepository, OrderRepository);

console.log('Auto-container initialized with', 9, 'classes');
console.log('Layers:', {
  application: 5,
  infrastructure: 2,
  domain: 2
});
