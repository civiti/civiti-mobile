#!/usr/bin/env node

/**
 * CI check: verifies all hex colors in source files exist in the design system.
 * Catches agents using wrong shades or inventing colors.
 *
 * Usage: node scripts/check-colors.js
 * Exit code 1 if unapproved colors found.
 */

const fs = require('fs');
const path = require('path');

// Approved hex colors from docs/design-system.md — UPDATE THIS when design system changes
const APPROVED_COLORS = new Set([
  // Core Brand
  '#14213D', '#FCA311', '#E5E5E5', '#FFFFFF', '#000000',
  // Semantic (light)
  '#28A745', '#DCFCE7', '#DC3545', '#FFF1F0', '#1890FF', '#E6F7FF',
  // Semantic (dark)
  '#4ADE80', '#14532D', '#F87171', '#450A0A', '#60A5FA', '#1A3A47',
  // Status/Urgency dark variants
  '#94A3B8', '#FBBF24', '#FB923C', '#93C5FD', '#1E2D3D',
  // Button dark danger pressed
  '#D46060',
  // Dark mode
  '#ECEDEE', '#151718', '#1E2022', '#262A2C', '#3A3F42', '#4A5057',
  // Light pressed
  '#D6D6D6',
  // Status — Draft/Cancelled
  '#64748B', '#F1F5F9', '#CBD5E1',
  // Status — Submitted
  '#91D5FF',
  // Status — UnderReview
  '#D48806', '#FFFBE6', '#FFE58F',
  // Status — Active (reuses #1890FF, #E6F7FF, #91D5FF)
  // Status — Resolved (reuses #28A745, #DCFCE7)
  '#86EFAC',
  // Status — Rejected (reuses #DC3545, #FFF1F0)
  '#FFB8B8',
  // Category
  '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444', '#6B7280',
  // Urgency — Low reuses #28A745/#DCFCE7, Medium reuses #F59E0B
  '#FEF3C7', '#F97316', '#FFEDD5',
  // Gradient
  '#FDB833',
]);

// Normalize to uppercase for comparison
const approvedUpper = new Set([...APPROVED_COLORS].map(c => c.toUpperCase()));

// Files/dirs to skip
const SKIP_DIRS = ['node_modules', '.expo', '.git', 'android', 'ios', 'dist', 'build', 'scripts', 'docs', '.github'];
const SKIP_FILES = ['app.config.ts', 'app.config.js', 'metro.config.js', 'babel.config.js'];
const CHECK_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (CHECK_EXTENSIONS.includes(path.extname(entry.name)) && !SKIP_FILES.includes(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Match 6-digit hex colors (not 3-digit shorthand)
const HEX_REGEX = /#[0-9A-Fa-f]{6}\b/g;

// Patterns that are likely not design-system colors (e.g. inside comments, imports)
const COMMENT_LINE = /^\s*\/\//;
const BLOCK_COMMENT_START = /\/\*/;

const root = path.resolve(__dirname, '..');
const files = getAllFiles(root);
const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (COMMENT_LINE.test(line)) continue;

    let match;
    HEX_REGEX.lastIndex = 0;
    while ((match = HEX_REGEX.exec(line)) !== null) {
      const color = match[0].toUpperCase();
      if (!approvedUpper.has(color)) {
        const relPath = path.relative(root, file);
        violations.push({
          file: relPath,
          line: i + 1,
          color: match[0],
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('\n❌ Unapproved colors found! Every hex must match docs/design-system.md exactly.\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  →  ${v.color}`);
  }
  console.error(`\n${violations.length} violation(s). Fix colors or add to design system.\n`);
  process.exit(1);
} else {
  console.log('✅ All colors match the design system.');
  process.exit(0);
}
