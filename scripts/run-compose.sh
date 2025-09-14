#!/bin/sh
# Usage: ./run-compose.sh <service-folder>
cd "$(dirname "$0")"
if [ -z "$1" ]; then
  echo "Usage: $0 <service-folder>"
  exit 1
fi
cd "../$1"
docker compose up