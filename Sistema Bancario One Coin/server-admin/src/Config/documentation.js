import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Sistema Bancario API - Node.js",
            version: "1.0.0",
            description: "API REST del sistema bancario. Gestión de cuentas, transacciones, divisas, favoritos y límites. La autenticación es manejada por el servicio .NET.",
            contact: {
                name: "Equipo BitCoiners",
                email: "soporte@bancosistema.com"
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor de desarrollo"
            }
        ],
        tags: [
            { name: "Auth",        description: "Registro e inicio de sesión" },
            { name: "Accounts",    description: "Gestión de cuentas bancarias" },
            { name: "Transaction", description: "Transferencias y reversiones" },
            { name: "Currencies",  description: "Tipos de cambio y conversión de divisas" },
            { name: "Favorites",   description: "Cuentas favoritas del usuario" },
            { name: "Limit",       description: "Límites de transacción por cuenta" },
            { name: "User",        description: "Gestión de usuarios del sistema" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Token JWT obtenido desde el servicio de autenticación .NET"
                }
            },
            schemas: {
                // ── Auth ─────────────────────────────────────────────────
                RegisterRequest: {
                    type: "object",
                    required: ["username", "email", "password"],
                    properties: {
                        username: { type: "string", example: "jperez" },
                        email:    { type: "string", example: "jperez@banco.com" },
                        password: { type: "string", example: "MiClave123" }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email:    { type: "string", example: "jperez@banco.com" },
                        password: { type: "string", example: "MiClave123" }
                    }
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        token:   { type: "string",  example: "eyJhbGciOiJIUzI1NiIs..." },
                        message: { type: "string",  example: "Login exitoso" }
                    }
                },
                // ── Accounts ─────────────────────────────────────────────
                CreateAccountRequest: {
                    type: "object",
                    required: ["type", "currency"],
                    properties: {
                        type:     { type: "string", enum: ["Ahorro", "Corriente"], example: "Ahorro" },
                        currency: { type: "string", example: "GTQ" }
                    }
                },
                Account: {
                    type: "object",
                    properties: {
                        _id:      { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        type:     { type: "string", example: "Ahorro" },
                        currency: { type: "string", example: "GTQ" },
                        balance:  { type: "number", example: 1500.00 },
                        owner:    { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0a" }
                    }
                },
                DepositWithdrawRequest: {
                    type: "object",
                    required: ["accountId", "amount"],
                    properties: {
                        accountId: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        amount:    { type: "number", example: 500.00 }
                    }
                },
                // ── Transactions ─────────────────────────────────────────
                TransferRequest: {
                    type: "object",
                    required: ["fromAccount", "toAccount", "amount"],
                    properties: {
                        fromAccount: { type: "string", example: "64f123abc456" },
                        toAccount:   { type: "string", example: "64f789xyz123" },
                        amount:      { type: "number", example: 100.00 }
                    }
                },
                Transaction: {
                    type: "object",
                    properties: {
                        _id:         { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0f" },
                        fromAccount: { type: "string", example: "64f123abc456" },
                        toAccount:   { type: "string", example: "64f789xyz123" },
                        amount:      { type: "number", example: 100.00 },
                        type:        { type: "string", enum: ["transfer", "deposit", "withdraw"], example: "transfer" },
                        status:      { type: "string", enum: ["completed", "reversed"], example: "completed" },
                        createdAt:   { type: "string", format: "date-time", example: "2025-01-15T10:30:00Z" }
                    }
                },
                // ── Currencies ───────────────────────────────────────────
                CurrencyRate: {
                    type: "object",
                    properties: {
                        base:  { type: "string", example: "GTQ" },
                        rates: {
                            type: "object",
                            example: { USD: 0.13, EUR: 0.12, MXN: 2.21 }
                        }
                    }
                },
                ConvertRequest: {
                    type: "object",
                    required: ["from", "to", "amount"],
                    properties: {
                        from:   { type: "string", example: "GTQ" },
                        to:     { type: "string", example: "USD" },
                        amount: { type: "number", example: 1000 }
                    }
                },
                ConvertResponse: {
                    type: "object",
                    properties: {
                        from:   { type: "string", example: "GTQ" },
                        to:     { type: "string", example: "USD" },
                        amount: { type: "number", example: 1000 },
                        result: { type: "number", example: 128.21 }
                    }
                },
                // ── Favorites ────────────────────────────────────────────
                FavoriteRequest: {
                    type: "object",
                    required: ["accountId", "alias"],
                    properties: {
                        accountId: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        alias:     { type: "string", example: "Cuenta mamá" }
                    }
                },
                Favorite: {
                    type: "object",
                    properties: {
                        _id:       { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0e" },
                        accountId: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        alias:     { type: "string", example: "Cuenta mamá" },
                        owner:     { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0a" }
                    }
                },
                // ── Limits ───────────────────────────────────────────────
                LimitRequest: {
                    type: "object",
                    required: ["accountId", "dailyLimit", "monthlyLimit"],
                    properties: {
                        accountId:    { type: "string", example: "64f123abc456" },
                        dailyLimit:   { type: "number", example: 5000 },
                        monthlyLimit: { type: "number", example: 20000 }
                    }
                },
                Limit: {
                    type: "object",
                    properties: {
                        _id:          { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0g" },
                        accountId:    { type: "string", example: "64f123abc456" },
                        dailyLimit:   { type: "number", example: 5000 },
                        monthlyLimit: { type: "number", example: 20000 }
                    }
                },
                // ── Users ────────────────────────────────────────────────
                CreateUserRequest: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name:     { type: "string", example: "Juan Perez" },
                        email:    { type: "string", example: "juan@test.com" },
                        password: { type: "string", example: "123456" },
                        role:     { type: "string", enum: ["Admin", "Cliente", "Cajero", "Auditor"], example: "Cliente" }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        _id:   { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0a" },
                        name:  { type: "string", example: "Juan Perez" },
                        email: { type: "string", example: "juan@test.com" },
                        role:  { type: "string", example: "Cliente" }
                    }
                },
                // ── Limits ───────────────────────────────────────────────
                LimitRequest: {
                    type: "object",
                    required: ["accountId", "dailyLimit", "monthlyLimit"],
                    properties: {
                        accountId:    { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        dailyLimit:   { type: "number", example: 5000 },
                        monthlyLimit: { type: "number", example: 20000 }
                    }
                },
                LimitUpdateRequest: {
                    type: "object",
                    properties: {
                        dailyLimit:   { type: "number", example: 6000 },
                        monthlyLimit: { type: "number", example: 25000 }
                    }
                },
                Limit: {
                    type: "object",
                    properties: {
                        _id:          { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        accountId:    { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        dailyLimit:   { type: "number", example: 5000 },
                        monthlyLimit: { type: "number", example: 20000 }
                    }
                },
                // ── Transactions ─────────────────────────────────────────
                TransferRequest: {
                    type: "object",
                    required: ["fromAccount", "toAccount", "amount"],
                    properties: {
                        fromAccount: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        toAccount:   { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0e" },
                        amount:      { type: "number", example: 500.00 }
                    }
                },
                Transaction: {
                    type: "object",
                    properties: {
                        _id:         { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0f" },
                        fromAccount: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
                        toAccount:   { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0e" },
                        amount:      { type: "number", example: 500.00 },
                        type:        { type: "string", enum: ["transfer", "deposit", "withdrawal"], example: "transfer" },
                        status:      { type: "string", enum: ["completed", "reversed"], example: "completed" },
                        createdAt:   { type: "string", format: "date-time", example: "2025-01-15T10:30:00Z" }
                    }
                },
                // ── Users ─────────────────────────────────────────────────
                CreateUserRequest: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name:     { type: "string", example: "Juan Perez" },
                        email:    { type: "string", example: "juan@banco.com" },
                        password: { type: "string", example: "MiClave123" },
                        role:     { type: "string", enum: ["Admin", "Cliente", "Cajero", "Auditor"], example: "Cliente" }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        _id:   { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0a" },
                        name:  { type: "string", example: "Juan Perez" },
                        email: { type: "string", example: "juan@banco.com" },
                        role:  { type: "string", example: "Cliente" }
                    }
                },
                // ── Shared ───────────────────────────────────────────────
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string",  example: "Operación realizada correctamente" }
                    }
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string",  example: "Error en la operación" }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./Routes/*.js", "./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "Sistema Bancario API Docs",
        swaggerOptions: {
            persistAuthorization: true
        }
    }));

    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log("📚 Swagger disponible en: http://localhost:3000/api-docs");
};