FROM node:14 AS builder
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build

FROM node:14-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
EXPOSE 3000
CMD ["yarn", "start:prod"]