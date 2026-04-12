# Sistema Bancario - Los Rezagados

> **Nota del Proyecto**
> Este sistema fue desarrollado con fines didácticos para el curso de **Taller de IN6AM**. Implementa una arquitectura moderna de microservicios, priorizando la seguridad financiera, la escalabilidad y las mejores prácticas en el manejo de datos bancarios.

---

## Descripción General

El **Sistema Bancario** es una solución integral para la gestión de operaciones financieras. Combina un potente servicio de autenticación desarrollado en **.NET 8** con servicios de negocio en **Node.js**, permitiendo una gestión segura de usuarios, cuentas, transacciones y conversión de divisas.

---

## Arquitectura del Sistema

El sistema utiliza una arquitectura de **microservicios independientes**:

### Authentication Service (.NET 8)
Es el núcleo de seguridad del sistema.

| Característica | Detalle |
|---|---|
| **Registro e Inicio de Sesión** | Manejo de credenciales con BCrypt |
| **Seguridad** | Control de acceso basado en roles (RBAC) |
| **Tokens** | Generación y validación de JWT para proteger rutas |
| **Persistencia** | Conexión robusta a PostgreSQL mediante Entity Framework Core |

### Banking & Core Services (Node.js)

- **Gestión de Cuentas:** Creación y administración de cuentas de ahorro y corrientes.
- **Transacciones:** Depósitos, retiros y transferencias seguras.
- **Divisas:** Módulo de conversión de moneda con tasas en tiempo real.

---

## Tecnologías Utilizadas

### Backend & Base de Datos

| Tecnología | Uso |
|---|---|
| **ASP.NET Core 8** | Microservicio de identidad |
| **Node.js & Express** | Servicios de negocio |
| **PostgreSQL** | Base de datos relacional para usuarios y roles |
| **MongoDB** | Almacenamiento para transacciones y reportes |
| **EF Core** | ORM para el mapeo de datos en .NET |

### Herramientas

| Herramienta | Uso |
|---|---|
| **Docker** | Contenerización de servicios y base de datos |
| **Git / GitHub** | Control de versiones |
| **Postman** | Pruebas de endpoints |

---

## Configuración con Docker (Base de Datos)

Para facilitar la revisión y el despliegue, el proyecto incluye un archivo `docker-compose.yml` para levantar la base de datos PostgreSQL de forma automática.

### Pasos para levantar la DB

1. Ubicarse en la raíz del proyecto.
2. Ejecutar el siguiente comando:

```bash
docker-compose up -d
```

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

---

## Prueba de Endpoints en Postman

> **Importante:** Para todas las rutas protegidas de Node.js, debes incluir el token JWT obtenido en el login de .NET en el header `Authorization: Bearer <token>`.

---

### Authentication Service — .NET 8 (`localhost:5109`)

#### 1. Registrar Usuario
```
POST http://localhost:5109/api/auth/register
```
```json
{
  "username": "rezagados",
  "email": "lrezagados@kinal.edu.gt",
  "password": "Admin123!",
  "firstName": "Reza",
  "lastName": "Gados"
}
```

#### 2. Login (obtener Token JWT)
```
POST http://localhost:5109/api/auth/login
```
```json
{
  "email": "lrezagados@kinal.edu.gt",
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
  "type": "ahorro"
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

#### 6. Ver Cuentas
```
GET http://localhost:3000/accounts
```

#### 7. Depositar Dinero
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

#### 8. Retirar Dinero
```
POST http://localhost:3000/accounts/withdraw
```
```json
{
  "accountId": "69a3c924bc757346fa89ff01",
  "amount": 5000
}
```
> Reemplaza `accountId` con el ID de tu cuenta.

#### 9. Transferir Dinero
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
> Reemplaza ambos IDs con los de las cuentas origen y destino.

#### 10. Historial de Transacciones
```
GET http://localhost:3000/transactions
```

---

##  Estructura del Repositorio

```plaintext
Los-Rezagados-Sistema-Bancario
│
├── authentication-service/   # Microservicio en .NET 8 (Auth & Users)
│   ├── auth-service/
│      ├── src/
│              ├── AuthService.Api/
│              ├── AuthService.Application/
│              ├── AuthService.Persistence/ # Mapeo de DB (PostgreSQL)
│              └── AuthService.Domain/
│   ├── pg/
│       └── docker-compose.yml
│   

├── ├── node_modules          # Microservicios en Node.js
│   └── src/
│       ├── Config/
│       ├── Controllers/
│       ├── Middleware/
│       ├── Models/
│       ├── Routes/
│       ├── services/
│       ├── app.js/
│       └── server.js/
│

```

---

## Estado del Proyecto

| Módulo | Estado |
|---|---|
| Arquitectura | 100% Implementada |
| Seguridad (JWT & RBAC) | Funcional |
| Base de Datos (Docker) | Migraciones ejecutadas y contenedor listo |
| Base de Datos (MongoDB) | Migraciones ejecutadas  |
| Limpieza de Código | 100% libre de archivos temporales y binarios |

---

## Autores

**Equipo:** Los Rezagados
**Curso:** Taller de IN6AM — Jornada Matutina
