# ExpressGo - Sistema de Gestión de Envíos

Autor

    Franco Alvarez
        Final Programación 3
            IES 9023

---

## Tecnologías utilizadas

### Backend
- NestJS
- Prisma ORM
- MongoDB
- OSRM (cálculo de rutas)
- Jest (Unit + E2E)

### Frontend
- React + Vite
- TypeScript
- Material UI
- Leaflet
- DnD Kit (Drag & Drop)
- Recharts (Dashboard)

### Infraestructura
- Docker
- Docker Compose

---

# Instalación y ejecución

## Opción 1 — Ejecutar con Docker 

### 1️⃣ Clonar el repositorio

```bash
    git clone https://github.com/Franco4848/Final-ExpressGo.git
    cd expressgo
```
### 2️⃣ Levantar los contenedores
    docker compose up -d --build

### 3️⃣ Acceder a la aplicación

    Frontend:
        http://localhost:5173

    Backend:
        http://localhost:3000


---
## Opción 2 — Ejecutar manualmente (sin Docker)
### Backend
    cd backend
    npm install
    npx prisma generate
    npx prisma db push
    npm run start:dev
    
    http://localhost:3000
    

 ### Frontend
    cd frontend
    npm install
    npm run dev
    
    http://localhost:5173

---
### Testing

    # Unit Tests
        cd backend
        npm run test
    
    # E2E Test
        npm run test:e2e




