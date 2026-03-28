#!/usr/bin/env tsx
/**
 * Directive Registry Validation Script
 * 
 * Ensures that the directive registry (src/lib/directiveRegistry.ts) stays
 * synchronized with the actual directive handlers in MarkdownRenderer.tsx.
 * 
 * This script:
 * 1. Extracts directive names from the registry
 * 2. Extracts directive names from the handler code
 * 3. Compares them and fails if there's a mismatch
 * 
 * Run this as part of the build process to catch sync issues early.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const REGISTRY_PATH = 'src/lib/directiveRegistry.ts';
const HANDLER_PATH = 'src/components/lesson/MarkdownRenderer.tsx';

interface ValidationResult {
  success: boolean;
  registryDirectives: string[];
  handlerDirectives: string[];
  missingInHandler: string[];
  missingInRegistry: string[];
}

/**
 * Extract directive names from the registry file
 * Only extracts top-level directive names, not attribute names
 */
function extractRegistryDirectives(content: string): string[] {
  const directives: string[] = [];

  // Match directive objects in the registry array
  // Look for objects that have both 'name' and 'displayName' fields (directives)
  // This distinguishes them from attribute objects which only have 'name'
  const directivePattern = /\{\s*name:\s*['"]([^'"]+)['"],\s*displayName:/g;
  let match;

  while ((match = directivePattern.exec(content)) !== null) {
    directives.push(match[1]);
  }

  return directives;
}

/**
 * Extract directive names from the handler code
 * Looks for: if (node.name === 'video') or else if (node.name === 'copy-button')
 */
function extractHandlerDirectives(content: string): string[] {
  const directives: string[] = [];
  
  // Match: node.name === 'video' or node.name === "video"
  const handlerPattern = /node\.name\s*===\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = handlerPattern.exec(content)) !== null) {
    directives.push(match[1]);
  }
  
  return [...new Set(directives)];
}

/**
 * Validate that registry and handlers are synchronized
 */
function validateDirectives(): ValidationResult {
  // Read files
  const registryContent = readFileSync(join(process.cwd(), REGISTRY_PATH), 'utf-8');
  const handlerContent = readFileSync(join(process.cwd(), HANDLER_PATH), 'utf-8');
  
  // Extract directive names
  const registryDirectives = extractRegistryDirectives(registryContent);
  const handlerDirectives = extractHandlerDirectives(handlerContent);
  
  // Find mismatches
  const missingInHandler = registryDirectives.filter(d => !handlerDirectives.includes(d));
  const missingInRegistry = handlerDirectives.filter(d => !registryDirectives.includes(d));
  
  const success = missingInHandler.length === 0 && missingInRegistry.length === 0;
  
  return {
    success,
    registryDirectives: registryDirectives.sort(),
    handlerDirectives: handlerDirectives.sort(),
    missingInHandler,
    missingInRegistry,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating directive registry synchronization...\n');
  
  const result = validateDirectives();
  
  console.log(`Registry directives: ${result.registryDirectives.join(', ')}`);
  console.log(`Handler directives:  ${result.handlerDirectives.join(', ')}\n`);
  
  if (result.success) {
    console.log('✅ Directive registry and handlers are synchronized!');
    process.exit(0);
  } else {
    console.error('❌ Directive registry and handlers are OUT OF SYNC!\n');
    
    if (result.missingInHandler.length > 0) {
      console.error('Missing in handler (MarkdownRenderer.tsx):');
      result.missingInHandler.forEach(d => {
        console.error(`  - ${d} (defined in registry but no handler found)`);
      });
      console.error('');
    }
    
    if (result.missingInRegistry.length > 0) {
      console.error('Missing in registry (directiveRegistry.ts):');
      result.missingInRegistry.forEach(d => {
        console.error(`  - ${d} (handler exists but not in registry)`);
      });
      console.error('');
    }
    
    console.error('To fix this:');
    console.error('1. Add missing directive handlers in src/components/lesson/MarkdownRenderer.tsx');
    console.error('2. Add missing registry entries in src/lib/directiveRegistry.ts');
    console.error('3. Ensure directive names match exactly between both files\n');
    
    process.exit(1);
  }
}

main();

