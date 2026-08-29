# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS dependencies

ENV NEXT_TELEMETRY_DISABLED=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Native libraries for Canvas, plus the media/transcript runtime tools.
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      ffmpeg \
      libcairo2-dev \
      libgif-dev \
      libjpeg62-turbo-dev \
      libpango1.0-dev \
      librsvg2-dev \
      pkg-config \
      python3 \
      python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./
COPY prisma ./prisma
COPY requirements.txt ./

RUN npm ci
RUN npx prisma generate
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

FROM dependencies AS development

ENV NODE_ENV=development

COPY . .
RUN sha256sum package-lock.json | awk '{print $1}' > node_modules/.package-lock.sha256

EXPOSE 3000

ENTRYPOINT ["sh", "./scripts/docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM dependencies AS builder

COPY . .
RUN npm run build

FROM dependencies AS production

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
