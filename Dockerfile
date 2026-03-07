# =============================================================================
# STAGE 1: DEPENDENCIES
# =============================================================================
FROM node:20-alpine AS deps

# libc6-compat required for Next.js on Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# --ignore-scripts prevents postinstall hooks from running prematurely
RUN npm ci --ignore-scripts

# =============================================================================
# STAGE 2: BUILDER
# =============================================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =============================================================================
# STAGE 3: RUNNER (PRODUCTION)
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD ["node", "server.js"]
