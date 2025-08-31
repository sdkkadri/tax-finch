#!/usr/bin/env tsx

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

interface ClassInfo {
  name: string;
  file: string;
  layer: 'application' | 'infrastructure' | 'domain';
  type: 'controller' | 'service' | 'repository' | 'entity' | 'other';
  decorators: string[];
}

async function generateContainers() {
  const srcPath = path.join(process.cwd(), 'src');
  
  // Find all TypeScript files
  const files = await glob('**/*.ts', { 
    cwd: srcPath,
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**', '**/di/**']
  });
  
  const classes: ClassInfo[] = [];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(srcPath, file), 'utf-8');
    
    // Look for classes with various decorators
    const classMatches = content.match(/export\s+class\s+(\w+)/g);
    const decoratorMatches = content.match(/@(\w+)/g);
    
    if (classMatches) {
      for (const match of classMatches) {
        const className = match.match(/export\s+class\s+(\w+)/)?.[1];
        if (className) {
          let layer: ClassInfo['layer'] = 'other';
          let type: ClassInfo['type'] = 'other';
          
          // Determine layer
          if (file.includes('application/')) layer = 'application';
          else if (file.includes('infrastructure/')) layer = 'infrastructure';
          else if (file.includes('domain/')) layer = 'domain';
          
          // Determine type
          if (file.includes('controller')) type = 'controller';
          else if (file.includes('service')) type = 'service';
          else if (file.includes('repository')) type = 'repository';
          else if (file.includes('entities/')) type = 'entity';
          
          // Extract decorators
          const decorators = decoratorMatches?.map(d => d.replace('@', '')) || [];
          
          classes.push({ 
            name: className, 
            file, 
            layer, 
            type, 
            decorators 
          });
        }
      }
    }
  }
  
  // Generate container files by layer
  generateContainerByLayer(classes, 'application', srcPath);
  generateContainerByLayer(classes, 'infrastructure', srcPath);
  generateContainerByLayer(classes, 'domain', srcPath);
  
  console.log(`Generated containers for ${classes.length} classes`);
}

function generateContainerByLayer(classes: ClassInfo[], layer: string, srcPath: string) {
  const layerClasses = classes.filter(c => c.layer === layer);
  
  if (layerClasses.length === 0) return;
  
  const containerCode = `// Auto-generated ${layer} container
// Generated on: ${new Date().toISOString()}
// Do not edit manually - run 'npm run generate:containers' to regenerate

import { container } from "tsyringe";

${layerClasses.map(c => {
  const relativePath = path.relative(`src/infrastructure/di`, c.file.replace('.ts', ''));
  return `import { ${c.name} } from "../../${relativePath}";`;
}).join('\n')}

// ${layer} layer registrations
${layerClasses.map(c => `container.registerSingleton(${c.name});`).join('\n')}

console.log('${layer} container initialized with', ${layerClasses.length}, 'classes');
`;
  
  const containerPath = path.join(srcPath, 'infrastructure', 'di', `${layer}.container.ts`);
  fs.writeFileSync(containerPath, containerCode);
}

// Run if called directly
if (require.main === module) {
  generateContainers().catch(console.error);
}
