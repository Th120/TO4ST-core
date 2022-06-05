FROM node:16 AS builder
ENV NODE_ENV=production
WORKDIR /app
RUN npm install -g @nestjs/cli
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build

FROM node:16-alpine
WORKDIR /home/node/app
COPY --chown=node:node --from=builder /app /home/node/app
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["yarn", "start:prod"]