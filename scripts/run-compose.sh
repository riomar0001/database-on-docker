#!/bin/sh
# Usage: ./run-compose.sh <service-folder>
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ -z "$1" ]; then
  echo "Usage: $0 <service-folder>"
  exit 1
fi

if [ ! -d "../$1" ]; then
  echo "Error: Service folder '$1' not found"
  exit 1
fi

cd "../$1" || exit 1
docker compose up