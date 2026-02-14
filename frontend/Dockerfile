# frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Exponemos el puerto de Vite (5173)
EXPOSE 5173

# Iniciamos Vite exponiendo la red (--host) para que Docker lo vea
CMD ["npm", "run", "dev", "--", "--host"]