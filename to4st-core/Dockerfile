FROM node:12 AS builder
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN npm install -g @nestjs/cli
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build

FROM node:12-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
EXPOSE 3000
CMD ["yarn", "start:prod"]