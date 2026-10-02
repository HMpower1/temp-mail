FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.mjs schema.sql ./
USER node
EXPOSE 8080 2525
CMD ["node", "index.mjs"]
