FROM node:20-alpine

WORKDIR /app

# Dependencias
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Código
COPY . .

# Prisma client
RUN pnpm db:generate

# Build Next
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
