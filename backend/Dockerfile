FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm run prisma:generate

COPY src ./src
RUN npm prune --omit=dev

FROM base AS runtime

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

EXPOSE 8080

USER node

CMD ["npm", "start"]