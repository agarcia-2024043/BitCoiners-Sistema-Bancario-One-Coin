import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./Config/database.js";

import accountRoutes from "./Routes/account.routes.js";
import transactionRoutes from "./Routes/transaction.routes.js";
import userRoutes from "./Routes/user.routes.js";
import currencyRoutes from "./Routes/currency.routes.js";
import favoriteRoutes from "./Routes/favorite.routes.js";
console.log("✅ favoriteRoutes cargado:", favoriteRoutes);
import limitRoutes from "./Routes/limit.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
    res.json({ 
        message: "Sistema Bancario - Node.js API",
        note: "Autenticación manejada por .NET AuthService"
    });
});

app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users", userRoutes);
app.use("/currencies", currencyRoutes);
app.get("/test-favorites", (req, res) => res.json({ ok: true }));
app.use("/favorites", favoriteRoutes);
app.use("/limits", limitRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

export default app;


