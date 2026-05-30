FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p src/data
EXPOSE 3000
CMD ["sh", "-c", "npm run init-db && npm start"]
