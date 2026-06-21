# ── Build Stage ──
FROM node:18-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY backend/tsconfig.json ./
COPY backend/prisma/ ./prisma/
RUN npx prisma generate

COPY backend/src/ ./src/
RUN npm run build

# ── Production Stage ──
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]
