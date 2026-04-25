import express from "express";
import { createUser, getUsers } from "../Controllers/user.controller.js";
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

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear usuario (Admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Juan Perez
 *             email: juan@test.com
 *             password: 123456
 *             role: Cliente
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Error en datos
 */
router.post("/", validateJWT, requireRole("Admin"), createUser);

export default router;