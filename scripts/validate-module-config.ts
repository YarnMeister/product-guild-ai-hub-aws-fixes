#!/usr/bin/env tsx

/**
 * Validation script to ensure module configuration matches data files.
 * 
 * Run this during development to verify that:
 * Usage:
 *   npx tsx scripts/validate-module-config.ts
 */

import { validateModuleConfig, printValidationResults } from "../src/lib/validateModuleConfig";

const result = validateModuleConfig();
printValidationResults(result);

// Exit with error code if validation failed
if (!result.isValid) {
  process.exit(1);
}

