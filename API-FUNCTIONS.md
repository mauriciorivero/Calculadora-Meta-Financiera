# 📡 Funciones Serverless de la API

Este documento lista todas las funciones serverless que se despliegan en Vercel.

## 📊 Resumen

**Total de funciones:** 9 de 12 permitidas en plan Hobby ✅

## 🗂️ Estructura de Funciones

### 1. Autenticación (3 funciones)

| Archivo | Endpoint | Métodos | Descripción |
|---------|----------|---------|-------------|
| `api/auth/register.js` | `/api/auth/register` | POST | Registro de nuevos usuarios |
| `api/auth/login.js` | `/api/auth/login` | POST | Inicio de sesión |
| `api/auth/me.js` | `/api/auth/me` | GET | Obtener usuario actual |

### 2. Usuarios (2 funciones)

| Archivo | Endpoint | Métodos | Descripción |
|---------|----------|---------|-------------|
| `api/users/index.js` | `/api/users` | GET, POST | Listar y crear usuarios |
| `api/users/[id].js` | `/api/users/:id` | GET, PUT, DELETE | Operaciones por ID de usuario |

### 3. Metas (2 funciones)

| Archivo | Endpoint | Métodos | Descripción |
|---------|----------|---------|-------------|
| `api/goals/index.js` | `/api/goals` | GET, POST | Listar y crear metas |
| `api/goals/[id].js` | `/api/goals/:id` | GET, PUT, DELETE | Operaciones por ID de meta |

### 4. Asignaciones Usuario-Meta (2 funciones)

| Archivo | Endpoint | Métodos | Descripción |
|---------|----------|---------|-------------|
| `api/user-goals/index.js` | `/api/user-goals` | GET, POST | Listar y crear asignaciones |
| `api/user-goals/[id].js` | `/api/user-goals/:id` | GET, PUT, DELETE | Operaciones por ID de asignación |

## 📚 Librerías Compartidas (NO cuentan como funciones)

Estos archivos son importados por las funciones pero no se despliegan como endpoints:

- `api/lib/db.js` - Conexión a PostgreSQL
- `api/lib/auth.js` - JWT y bcrypt
- `api/lib/response.js` - Respuestas HTTP estandarizadas
- `api/lib/sql-helper.js` - Utilidades SQL

## 🚫 Archivos Excluidos del Deployment

Los siguientes archivos están en `.gitignore` y NO se despliegan:

- `server.js` - Servidor de desarrollo local
- `test-connection.js` - Script de prueba MySQL
- `test-connection-postgresql.js` - Script de prueba PostgreSQL
- `convert-to-postgresql.js` - Script de conversión

Estos archivos solo existen localmente para desarrollo.

## 📝 Notas

- **Plan Hobby de Vercel:** Máximo 12 funciones serverless
- **Uso actual:** 9 funciones (75% del límite)
- **Margen disponible:** 3 funciones más

## 🔄 Endpoints Completos

### Autenticación
```
POST   /api/auth/register    - Registrar usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/me          - Usuario actual
```

### Usuarios
```
GET    /api/users            - Listar usuarios
POST   /api/users            - Crear usuario
GET    /api/users/:id        - Obtener usuario
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

### Metas
```
GET    /api/goals            - Listar metas
POST   /api/goals            - Crear meta
GET    /api/goals/:id        - Obtener meta
PUT    /api/goals/:id        - Actualizar meta
DELETE /api/goals/:id        - Eliminar meta
```

### Asignaciones
```
GET    /api/user-goals       - Listar asignaciones
POST   /api/user-goals       - Crear asignación
GET    /api/user-goals/:id   - Obtener asignación
PUT    /api/user-goals/:id   - Actualizar asignación
DELETE /api/user-goals/:id   - Eliminar asignación
```

## ✅ Verificación

Para verificar el número de funciones antes de hacer deploy:

```bash
# Contar funciones serverless (excluye lib/)
find api -name "*.js" -type f | grep -v "lib/" | wc -l
```

Resultado esperado: **9**
