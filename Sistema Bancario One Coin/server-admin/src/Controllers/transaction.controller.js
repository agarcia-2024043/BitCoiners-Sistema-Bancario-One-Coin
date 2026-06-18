import express from "express";
import {
  getTransactions,
  transfer,
} from "../Controllers/transaction.controller.js";
import { validateJWT, requireRole} from "../Middleware/validate-jwt.js";
import { reverseTransaction, updateDepositAmount } from "../Controllers/reversal.controller.js";

const router = express.Router();

router.use(validateJWT);

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Gestión de transacciones bancarias
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Obtener historial de transacciones
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
router.get("/", validateJWT, getTransactions);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Realizar transferencia
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             fromAccount: 64f123abc456
 *             toAccount: 64f789xyz123
 *             amount: 100
 *     responses:
 *       200:
 *         description: Transferencia realizada correctamente
 *       400:
 *         description: Error en la transacción
 */
router.post("/transfer", validateJWT, transfer);

/**
 * @swagger
 * /transactions/{id}/reverse:
 *   post:
 *     summary: Revertir transacción (Admin)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transacción revertida
 *       403:
 *         description: No autorizado
 */
router.post("/:id/reverse", validateJWT, requireRole("Admin"), reverseTransaction);

/**
 * @swagger
 * /transactions/{id}/amount:
 *   patch:
 *     summary: Editar el monto de un depósito (Admin)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             amount: 150
 *     responses:
 *       200:
 *         description: Monto actualizado correctamente
 *       400:
 *         description: Error de validación
 */
router.patch("/:id/amount", validateJWT, requireRole("Admin"), updateDepositAmount);

export default router;