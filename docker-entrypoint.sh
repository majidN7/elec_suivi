#!/bin/sh
set -e

echo "Waiting for database migrations..."
npx prisma migrate deploy

echo "Ensuring national administrator account exists..."
npx prisma db seed

exec "$@"
