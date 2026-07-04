# 🏦 Sistema Bancario - One Coin

> **Nota del Proyecto**
> Este sistema fue desarrollado con fines didácticos para el curso de **Taller de IN6AM**. Implementa una arquitectura moderna de microservicios, priorizando la seguridad financiera, la escalabilidad y las mejores prácticas en el manejo de datos bancarios.

---

## 📖 Descripción General

El **Sistema Bancario One Coin** es un ecosistema financiero completo. Combina un potente servicio de autenticación en **.NET 8**, servicios transaccionales atómicos en **Node.js**, un panel de control web para administradores construido en **React**, y una aplicación móvil nativa desarrollada en **React Native** para los clientes del banco.

---

## 🏗️ Arquitectura del Sistema

El ecosistema está dividido en cuatro componentes principales:

### 1. Authentication Service (.NET 8)
El núcleo de seguridad e identidad del banco.
- **Autenticación:** Generación y validación de tokens JWT. Contraseñas seguras con BCrypt.
- **Seguridad (RBAC):** Control estricto de roles (Admin, Cliente).
- **KYC (Know Your Customer):** Registro exhaustivo de clientes (DPI, Nombre Completo, Ingresos, Trabajo, etc.).
- **Persistencia:** Base de datos **PostgreSQL** mediante Entity Framework Core.

### 2. Banking & Core Services (Node.js)
El motor financiero del banco.
- **Gestión de Cuentas:** Límite de 5 cuentas por tipo (Ahorro, Monetaria, Corriente), autogeneración de nombres.
- **Transacciones Atómicas:** Depósitos, retiros y transferencias seguras con validación estricta de fondos y límites de uso.
- **Divisas:** Integración con la API en tiempo real de **Frankfurter** (con fallback local seguro) para conversión de divisas.
- **Persistencia:** Base de datos **MongoDB**.

### 3. Panel de Administración Web (React)
Dashboard exclusivo para el personal del banco.
- **Analíticas:** Listado de usuarios activos/inactivos y tabla analítica de "Cuentas ordenadas por movimientos".
- **Gestión de Clientes (CRUD):** Creación, edición, deshabilitación y eliminación de perfiles de clientes.
- **UI/UX:** Diseño premium con TailwindCSS, gráficos e interfaces reactivas.

### 4. OneCoin Mobile App (React Native / Expo)
La aplicación para el cliente final.
- **Banca Móvil:** Consulta de saldos, detalle de cuentas y transferencias.
- **Funcionalidades:** Guardado de contactos/favoritos, conversor de divisas integrado y configuración de perfil.
- **Seguridad:** Navegación protegida por el token de sesión (AuthStack / MainTabs).

---

## 🛠️ Tecnologías Utilizadas

| Entorno | Tecnologías |
|---|---|
| **Backend Identity** | ASP.NET Core 8, EF Core, PostgreSQL |
| **Backend Core** | Node.js, Express, Mongoose, MongoDB |
| **Frontend Admin** | React, Vite, TailwindCSS, Zustand |
| **Mobile App** | React Native, Expo, Lucide Icons, Moti |
| **Infraestructura** | Docker, Docker Compose |

---

## 🚀 Configuración y Despliegue

El proyecto incluye contenedores pre-configurados para levantar las bases de datos de forma automática.

### 1. Levantar Bases de Datos (Docker)

Ubícate en la carpeta `authentication-service/pg/` y ejecuta:

```bash
docker-compose up -d
```

Esto levantará la instancia de PostgreSQL con las credenciales necesarias.

### Configuración del contenedor

```yaml
version: '3.8'

services:
  db:
    image: postgres:latest
    container_name: bancario-auth-db
    environment:
      POSTGRES_PASSWORD: SystemBank0101@reza
      POSTGRES_DB: BankAuthDb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Levantar Microservicios

Cada backend se levanta en su propia terminal:

| Servicio | Comando | Puerto |
|---|---|---|
| **.NET (Identity)** | `dotnet run` | `localhost:5109` |
| **Node.js (Core)** | `pnpm run dev` | `localhost:3000` |

### 3. Levantar Clientes (Frontends)

| Cliente | Comando | Ubicación |
|---|---|---|
| **Panel Web Admin** | `pnpm run dev` | `client-OneCoin/` |
| **App Móvil** | `pnpm start` | `OneCoin-client/` |

---

## 🔗 Prueba de Endpoints en Postman

> **Importante:** Para todas las rutas protegidas de Node.js, debes incluir el token JWT obtenido en el login de .NET en el header `Authorization: Bearer <token>`.

---

### Authentication Service — .NET 8 (`localhost:5109`)

#### 1. Registrar Usuario
```
POST http://localhost:5109/api/auth/register
```
```json
{
  "username": "juan.perez",
  "email": "juan@correo.com",
  "password": "Admin123!",
  "fullName": "Juan Pérez",
  "dpi": "1234567890123",
  "address": "Zona 1, Ciudad de Guatemala",
  "phoneNumber": "5555-1234",
  "jobName": "Empresa ABC",
  "monthlyIncome": 5000
}
```

#### 2. Login (obtener Token JWT)
```
POST http://localhost:5109/api/auth/login
```
```json
{
  "email": "juan@correo.com",
  "password": "Admin123!"
}
```
> Copia el token devuelto — lo necesitarás en todas las rutas siguientes.

#### 3. Ver perfil y roles
```
GET http://localhost:5109/api/auth/me
```
> Requiere token en el header: `Authorization: Bearer <token>`

---

### Banking Services — Node.js (`localhost:3000`)

> Todas las rutas requieren el token del login en el header: `Authorization: Bearer <token>`

#### 4. Crear Cuenta de Ahorro
```
POST http://localhost:3000/accounts/create
```
```json
{
  "type": "ahorro",
  "name": "Mi cuenta principal"
}
```

#### 5. Crear Cuenta Monetaria
```
POST http://localhost:3000/accounts/create
```
```json
{
  "type": "monetaria"
}
```
> Si no envías `name`, el sistema genera uno automáticamente (ej: "Monetaria #1").

#### 6. Ver Cuentas
```
GET http://localhost:3000/accounts
```

#### 7. Cuentas Ordenadas por Movimientos (Admin)
```
GET http://localhost:3000/accounts/by-movements?order=desc
```

#### 8. Depositar Dinero
```
POST http://localhost:3000/accounts/deposit
```
```json
{
  "accountId": "69a3c924bc757346fa89ff01",
  "amount": 5000
}
```
> Reemplaza `accountId` con el ID de tu cuenta.

#### 9. Retirar Dinero
```
POST http://localhost:3000/accounts/withdraw
```
```json
{
  "accountId": "69a3c924bc757346fa89ff01",
  "amount": 500
}
```

#### 10. Transferir Dinero
```
POST http://localhost:3000/transactions/transfer
```
```json
{
  "fromAccountId": "69a3c924bc757346fa89ff01",
  "toAccountId": "69a3c863bc757346fa89fefd",
  "amount": 500
}
```
> También puedes enviar un `accountNumber` (ej: "ACC123456") en `toAccountId` y el sistema lo resolverá automáticamente.

#### 11. Historial de Transacciones
```
GET http://localhost:3000/transactions
```

#### 12. Consultar Tasas de Cambio (Tiempo Real)
```
GET http://localhost:3000/currencies
```

#### 13. Convertir Divisas
```
POST http://localhost:3000/currencies/convert
```
```json
{
  "amount": 100,
  "from": "USD",
  "to": "GTQ"
}
```

---

## 📂 Estructura del Repositorio

```plaintext
BitCoiners-Sistema-Bancario-One-Coin/
│
├── authentication-service/       # Microservicio en .NET 8 (Auth & Identity)
│   ├── pg/                       # Docker Compose de PostgreSQL
│   └── auth-service/src/
│       ├── AuthService.Api/          # Controladores y configuración de la API
│       ├── AuthService.Application/  # DTOs, servicios de negocio
│       ├── AuthService.Domain/       # Entidades e interfaces del dominio
│       └── AuthService.Persistence/  # Contexto de DB, migraciones EF Core
│
├── server-admin/                 # Microservicio en Node.js (Core Financiero)
│   └── src/
│       ├── Controllers/              # Lógica de cuentas, transacciones, divisas, reversiones
│       ├── Models/                   # Esquemas de Mongoose (Account, Transaction, Limit)
│       ├── Routes/                   # Definición de endpoints y Swagger
│       ├── Services/                 # Servicios atómicos (deposit, withdraw, transfer)
│       └── Middleware/               # Validación de JWT y control de roles
│
├── client-OneCoin/               # Frontend Web — Panel de Administración (React + Vite)
│   └── src/
│       ├── app/layouts/              # Layout principal del Dashboard
│       ├── features/admin/           # Páginas del Admin (Home, Users — CRUD completo)
│       ├── features/client/          # Páginas del Cliente (Depósitos, Transferencias, Favoritos)
│       ├── features/auth/            # Store de autenticación (Zustand)
│       └── shared/apis/             # Clientes Axios para consumir los backends
│
└── OneCoin-client/               # App Móvil — Cliente Final (React Native + Expo)
    ├── assets/                       # Logos e íconos de la marca
    └── src/
        ├── features/
        │   ├── accounts/             # Listado, detalle y creación de cuentas
        │   ├── auth/                 # Login y Registro
        │   ├── cards/                # Visualización de tarjetas
        │   ├── currencies/           # Convertidor de divisas
        │   ├── favorites/            # Gestión de contactos favoritos
        │   ├── profile/              # Perfil de usuario y notificaciones
        │   ├── services/             # Seguros y servicios adicionales
        │   └── transactions/         # Historial y pantalla de transferencias
        ├── navigation/               # AuthStack y MainTabs (React Navigation)
        └── shared/                   # API clients, componentes comunes, tema y store
```

---

## 📊 Estado del Proyecto

| Módulo | Estado |
|---|---|
| Arquitectura Microservicios | ✅ 100% Finalizado |
| Seguridad e Identidad (KYC) | ✅ 100% Funcional |
| Lógica Transaccional | ✅ Finalizado |
| Conversión de Divisas (API Real) | ✅ Integrado con Frankfurter |
| Dashboard Web (React) | ✅ Operativo (Full CRUD) |
| App Móvil (React Native) | ✅ Operativa |
| Limpieza de Código | ✅ 100% libre de archivos temporales y binarios |

---

## 👥 Autores

**Equipo:** BitCoiners  
**Curso:** Taller de IN6AM — Jornada Matutina
