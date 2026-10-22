# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the Next.js application
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for public environment variables (defaults match .env)
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=956248583975-95ggrtg1j9ra2s8tv5f0elbqsl6hvppa.apps.googleusercontent.com
ARG NEXT_PUBLIC_AWS_BUCKET_NAME=batchly
ARG NEXT_PUBLIC_AWS_REGION=ap-south-1

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_AWS_BUCKET_NAME=$NEXT_PUBLIC_AWS_BUCKET_NAME
ENV NEXT_PUBLIC_AWS_REGION=$NEXT_PUBLIC_AWS_REGION

ENV NEXT_TELEMETRY_DISABLED=1

# Ensure public directory exists so COPY doesn't fail
RUN mkdir -p public

RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
