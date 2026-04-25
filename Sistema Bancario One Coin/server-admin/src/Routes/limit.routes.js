import express from "express";
import { getLimits, createLimits, updateLimits, deleteLimits } from "../Controllers/limit.controller.js";
import { validateJWT, requireRole } from "../Middleware/validate-jwt.js";

const router = express.Router();
router.use(validateJWT);

/**
 * @swagger
 * tags:
 *   name: Limit
 *   description: Gestión de límites de cuentas bancarias
 */

/**
 * @swagger
 * /limits/{accountId}:
 *   get:
 *     summary: Obtener límites de una cuenta
 *     tags: [Limit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f123abc456
 *     responses:
 *       200:
 *         description: Límites obtenidos correctamente
 *       404:
 *         description: Cuenta no encontrada
 */
router.get("/:accountId", validateJWT, getLimits);

/**
 * @swagger
 * /limits:
 *   post:
 *     summary: Crear límites para una cuenta (Admin)
 *     tags: [Limit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             accountId: 64f123abc456
 *             dailyLimit: 5000
 *             monthlyLimit: 20000
 *     responses:
 *       201:
 *         description: Límites creados
 *       403:
 *         description: No autorizado
 */
router.post("/", validateJWT, requireRole("Admin"), createLimits);

/**
 * @swagger
 * /limits/{accountId}:
 *   put:
 *     summary: Actualizar límites (Admin)
 *     tags: [Limit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             dailyLimit: 6000
 *             monthlyLimit: 25000
 *     responses:
 *       200:
 *         description: Límites actualizados
 */
router.put("/:accountId", validateJWT, requireRole("Admin"), updateLimits);

/**
 * @swagger
 * /limits/{accountId}:
 *   delete:
 *     summary: Eliminar límites (Admin)
 *     tags: [Limit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Límites eliminados
 */
router.delete("/:accountId", validateJWT, requireRole("Admin"), deleteLimits);

export default router;