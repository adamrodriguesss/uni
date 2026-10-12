#!/bin/bash
cd /home/hatsunemiku/Development/uni/micro

# Create Gateway
mkdir -p gateway/src
cd gateway
npm init -y
npm install express cors http-proxy-middleware
npm install -D typescript @types/node @types/express @types/cors tsx
npx tsc --init
cd ..

# Create Services
for SERVICE in search home cart checkout; do
  mkdir -p services/$SERVICE/src
  cd services/$SERVICE
  npm init -y
  npm install express cors pg dotenv
  npm install -D typescript @types/node @types/express @types/cors @types/pg tsx
  npx tsc --init
  cd ../..
done

