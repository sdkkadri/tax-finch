#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 Starting auto-discovery in Docker...');

// Define all the classes we know about (only actual classes, not interfaces)
const classes = [
  // Application Layer
  { name: 'UserController', file: 'application/controller/user.controller.ts', layer: 'application', type: 'controller' },
  { name: 'UserService', file: 'application/service/user.service.ts', layer: 'application', type: 'service' },
  { name: 'ItemController', file: 'application/controller/item.controller.ts', layer: 'application', type: 'controller' },
  { name: 'OrderService', file: 'application/service/order.service.ts', layer: 'application', type: 'service' },
  
  // Infrastructure Layer
  { name: 'UserRepository', file: 'infrastructure/database/repositories/UserRepository.ts', layer: 'infrastructure', type: 'repository' },
  { name: 'OrderRepository', file: 'infrastructure/database/repositories/OrderRepository.ts', layer: 'infrastructure', type: 'repository' },
  
  // Domain Layer (only actual classes, not interfaces)
  { name: 'UserEntity', file: 'domain/entities/user.ts', layer: 'domain', type: 'entity' },
  { name: 'OrderEntity', file: 'domain/entities/order.ts', layer: 'domain', type: 'entity' },
];

console.log(`📦 Found ${classes.length} classes to register`);

// Group by layer
const byLayer = {
  application: classes.filter(c => c.layer === 'application'),
  infrastructure: classes.filter(c => c.layer === 'infrastructure'),
  domain: classes.filter(c => c.layer === 'domain')
};

console.log('🏗️ Classes by layer:', {
  application: byLayer.application.length,
  infrastructure: byLayer.infrastructure.length,
  domain: byLayer.domain.length
});

try {
  // Get current working directory
  const cwd = process.cwd();
  console.log('📁 Current working directory:', cwd);
  
  // Check if we're in Docker
  const isDocker = fs.existsSync('/.dockerenv');
  console.log('🐳 Running in Docker:', isDocker);
  
  // Build the DI path
  const diPath = path.join(cwd, 'src', 'infrastructure', 'di');
  console.log('📁 DI path:', diPath);
  
  // Ensure the directory exists
  if (!fs.existsSync(diPath)) {
    console.log('📁 Creating DI directory...');
    fs.mkdirSync(diPath, { recursive: true });
  }
  
  // Create the auto-container.ts file
  const autoContainerContent = `// Auto-generated container with ${classes.length} classes
// Generated on: ${new Date().toISOString()}
// Do not edit manually - run 'npm run auto:discover' to regenerate

import "reflect-metadata";
import { container } from "tsyringe";

// Auto-registered classes
${classes.map(c => `import { ${c.name} } from "../../${c.file.replace('.ts', '')}";`).join('\n')}

// Register all classes as singletons
${classes.map(c => `container.registerSingleton(${c.name});`).join('\n')}

console.log('Auto-container initialized with', ${classes.length}, 'classes');
console.log('Layers:', {
  application: ${byLayer.application.length},
  infrastructure: ${byLayer.infrastructure.length},
  domain: ${byLayer.domain.length}
});
`;

  // Write the auto-container file only
  const autoContainerPath = path.join(diPath, 'auto-container.ts');
  fs.writeFileSync(autoContainerPath, autoContainerContent);
  console.log('✅ Generated auto-container.ts');
  
  console.log('\n🎉 Successfully generated auto-container.ts');
  console.log(`📊 Total classes registered: ${classes.length}`);
  
} catch (error) {
  console.error('❌ Error generating container files:', error);
  console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  process.exit(1);
}

console.log('🚀 Auto-discovery completed successfully!');
