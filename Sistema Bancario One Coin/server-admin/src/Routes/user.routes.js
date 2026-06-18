import express from "express";
import { getUsers } from "../Controllers/user.controller.js";
import { validateJWT, requireRole } from "../Middleware/validate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (Admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: No autorizado
 */
router.get("/", validateJWT, requireRole("Admin"), getUsers);

export default router;