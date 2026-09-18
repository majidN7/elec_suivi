FROM node:22-bookworm-slim AS base
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Build the application ----
FROM base AS builder
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci --legacy-peer-deps
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Production image ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh \
  && chmod +x ./docker-entrypoint.sh \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
