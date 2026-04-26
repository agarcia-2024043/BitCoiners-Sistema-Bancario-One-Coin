import express from "express";
import { getRates, convertCurrency } from "../Controllers/currency.controller.js";
import { validateJWT } from "../Middleware/validate-jwt.js";

const router = express.Router();
router.use(validateJWT);

/**
 * @swagger
 * tags:
 *   name: Currencies
 *   description: Tipos de cambio y conversión de divisas
 */

/**
 * @swagger
 * /currencies:
 *   get:
 *     summary: Obtener tipos de cambio
 *     description: Retorna los tipos de cambio actuales con base en la moneda configurada (GTQ por defecto).
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de cambio obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrencyRate'
 *       401:
 *         description: Token JWT inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al obtener los tipos de cambio.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getRates);

/**
 * @swagger
 * /currencies/convert:
 *   post:
 *     summary: Convertir divisa
 *     description: Convierte un monto de una divisa a otra usando los tipos de cambio actuales.
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConvertRequest'
 *     responses:
 *       200:
 *         description: Conversión realizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConvertResponse'
 *       400:
 *         description: Divisa no soportada o monto inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token JWT inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/convert", convertCurrency);

export default router;