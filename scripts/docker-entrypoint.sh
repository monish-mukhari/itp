#!/bin/sh
set -eu

lock_hash="$(sha256sum package-lock.json | awk '{print $1}')"
installed_hash=""

if [ -f node_modules/.package-lock.sha256 ]; then
  installed_hash="$(cat node_modules/.package-lock.sha256)"
fi

if [ "$lock_hash" != "$installed_hash" ]; then
  echo "package-lock.json changed; refreshing container dependencies..."
  npm ci
  printf '%s' "$lock_hash" > node_modules/.package-lock.sha256
fi

# This is fast when unchanged and keeps Prisma Client synchronized with schema.prisma.
npx prisma generate

exec "$@"
