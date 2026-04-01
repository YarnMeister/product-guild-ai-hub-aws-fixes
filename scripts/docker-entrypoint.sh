#!/bin/sh
set -e

echo "Running database migrations..."
node scripts/migrate-safe.mjs

echo "Syncing content to database..."
node scripts/sync-content-to-db.mjs

echo "Starting server..."
exec node --import tsx/esm scripts/api-server.mjs

