import express from "express";
import { getFavorites, addFavorite, updateFavorite, deleteFavorite } from "../Controllers/favorite.controller.js";
import { validateJWT } from "../Middleware/validate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gestión de cuentas favoritas del usuario
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener cuentas favoritas
 *     description: Retorna la lista de cuentas marcadas como favoritas por el usuario autenticado.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Token JWT inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", validateJWT, getFavorites);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Agregar cuenta favorita
 *     description: Agrega una cuenta bancaria a la lista de favoritos del usuario autenticado con un alias personalizado.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteRequest'
 *     responses:
 *       201:
 *         description: Favorito agregado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Datos inválidos o favorito ya existente.
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
router.post("/", validateJWT, addFavorite);

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     summary: Actualizar alias de favorito
 *     description: Actualiza el alias de una cuenta favorita del usuario autenticado.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del favorito a actualizar
 *         example: "664f1a2b3c4d5e6f7a8b9c0e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alias:
 *                 type: string
 *                 example: "Cuenta hermano"
 *     responses:
 *       200:
 *         description: Favorito actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: Favorito no encontrado.
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
router.put("/:id", validateJWT, updateFavorite);

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: Eliminar cuenta favorita
 *     description: Elimina una cuenta de la lista de favoritos del usuario autenticado.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del favorito a eliminar
 *         example: "664f1a2b3c4d5e6f7a8b9c0e"
 *     responses:
 *       200:
 *         description: Favorito eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Favorito no encontrado.
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
router.delete("/:id", validateJWT, deleteFavorite);

export default router;