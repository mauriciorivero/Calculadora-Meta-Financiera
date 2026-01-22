# Calculadora de Meta Financiera

Aplicación web para gestionar metas financieras con sistema de autenticación de usuarios.

## Estructura del Proyecto (Monorepo)

```
├── api/                    # Backend - Funciones serverless para Vercel
│   ├── lib/               # Librerías compartidas
│   │   ├── db.js          # Clase de conexión a MySQL
│   │   ├── auth.js        # Utilidades de autenticación (JWT, bcrypt)
│   │   └── response.js    # Helpers para respuestas HTTP
│   ├── auth/              # Endpoints de autenticación
│   │   ├── login.js       # POST /api/auth/login
│   │   ├── register.js    # POST /api/auth/register
│   │   └── me.js          # GET /api/auth/me
│   ├── users/             # CRUD de usuarios
│   │   ├── index.js       # GET, POST /api/users
│   │   └── [id].js        # GET, PUT, DELETE /api/users/:id
│   ├── goals/             # CRUD de metas financieras
│   │   ├── index.js       # GET, POST /api/goals
│   │   └── [id].js        # GET, PUT, DELETE /api/goals/:id
│   └── user-goals/        # Asignación metas-usuario
│       ├── index.js       # GET, POST /api/user-goals
│       └── [id].js        # GET, PUT, DELETE /api/user-goals/:id
├── database/              # Scripts de base de datos
│   └── schema.sql         # Esquema de tablas MySQL
├── index.html             # Frontend - Página principal
├── styles.css             # Estilos CSS
├── script.js              # Lógica del frontend
├── md5.js                 # Encriptación MD5 (legacy)
├── package.json           # Dependencias del proyecto
├── vercel.json            # Configuración de Vercel
├── .env.example           # Plantilla de variables de entorno
└── .gitignore             # Archivos ignorados por Git
```

## Requisitos

- Node.js >= 18.0.0
- MySQL 8.0+
- Cuenta en Vercel (para despliegue)

## Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
   cd Calculadora-Meta-Financiera
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de MySQL
   ```

4. **Crear la base de datos**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `tu_password` |
| `DB_NAME` | Nombre de la BD | `meta_financiera` |
| `JWT_SECRET` | Clave secreta para JWT | `clave_muy_segura` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear usuario |
| GET | `/api/users/:id` | Obtener usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

### Metas Financieras

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/goals` | Listar metas |
| POST | `/api/goals` | Crear meta |
| GET | `/api/goals/:id` | Obtener meta |
| PUT | `/api/goals/:id` | Actualizar meta |
| DELETE | `/api/goals/:id` | Eliminar meta |

### Asignación Metas-Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/user-goals` | Listar asignaciones |
| POST | `/api/user-goals` | Asignar meta a usuario |
| GET | `/api/user-goals/:id` | Obtener asignación |
| PUT | `/api/user-goals/:id` | Actualizar progreso |
| DELETE | `/api/user-goals/:id` | Eliminar asignación |

## Despliegue en Vercel

**📖 Para instrucciones detalladas de despliegue, consulta [DEPLOY.md](./DEPLOY.md)**

### Resumen rápido:

1. **Configurar variables de entorno en Vercel Dashboard:**
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`, `JWT_EXPIRES_IN`

2. **Habilitar Remote MySQL en SiteGround:**
   - cPanel → Remote MySQL → Agregar `%` o IPs de Vercel

3. **Desplegar:**
   ```bash
   # Opción 1: Desde GitHub (recomendado)
   # Conecta tu repo en vercel.com/dashboard
   
   # Opción 2: Usando CLI
   npm i -g vercel
   vercel login
   vercel --prod
   ```

4. **Verificar:** Abre la URL de Vercel y prueba registro/login/metas

## Base de Datos MySQL en la Nube

Opciones recomendadas para MySQL online:
- [PlanetScale](https://planetscale.com/) - MySQL serverless
- [Railway](https://railway.app/) - MySQL hosting
- [Aiven](https://aiven.io/) - MySQL managed
- [AWS RDS](https://aws.amazon.com/rds/) - MySQL en AWS

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Vercel Serverless Functions
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: bcryptjs
- **Email**: EmailJScencia

## Licencia

MIT
