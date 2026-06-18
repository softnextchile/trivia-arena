FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/data
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data
EXPOSE 3000
ENV NODE_ENV=production
USER nodejs
CMD ["node", "server.js"]
