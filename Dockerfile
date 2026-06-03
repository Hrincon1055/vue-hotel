# =============================================
# Dockerfile para Frontend Vue.js - Hotel Management
# Multi-stage build optimizado para Vite + Vuetify
# =============================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Copiar archivo de entorno para producción
COPY .env.production .env

# Construir la aplicación
# Usamos build-only para evitar type-check que puede fallar en Docker
RUN npm run build-only

# Stage 2: Production con Nginx
FROM nginx:alpine AS production

# Copiar archivos construidos de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
