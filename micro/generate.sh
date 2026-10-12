#!/bin/bash
cd /home/hatsunemiku/Development/uni/micro

cat << 'PKG' > gateway/package.json
{
  "name": "gateway",
  "version": "1.0.0",
  "scripts": { "start": "node dist/index.js" },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "http-proxy-middleware": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17"
  }
}
PKG

cat << 'TSCFG' > gateway/tsconfig.json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  }
}
TSCFG

for SERVICE in search home cart checkout; do
  cat << PKG > services/$SERVICE/package.json
{
  "name": "$SERVICE-service",
  "version": "1.0.0",
  "scripts": { "start": "node dist/index.js" },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "pg": "^8.11.5"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/pg": "^8.11.6"
  }
}
PKG
  cp gateway/tsconfig.json services/$SERVICE/tsconfig.json
done
