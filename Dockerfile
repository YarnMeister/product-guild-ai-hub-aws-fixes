FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run validate-directives && npm run generate-content-index
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install tsx
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/_api ./_api
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public/content ./public/content
COPY --from=builder /app/public/content-index.json ./public/content-index.json
COPY --from=builder /app/tsconfig.api.json ./tsconfig.api.json
EXPOSE 3000
RUN chmod +x scripts/docker-entrypoint.sh
ENTRYPOINT ["sh", "scripts/docker-entrypoint.sh"]

