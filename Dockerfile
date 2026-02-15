# backend/Dockerfile

# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Creamos la carpeta de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar el caché)
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para iniciar en modo desarrollo
CMD ["npm", "run", "start:dev"]