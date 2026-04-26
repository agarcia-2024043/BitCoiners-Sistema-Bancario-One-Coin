import { Router } from 'express';
import { createAccount, getAccounts, deposit, withdraw } from '../Controllers/account.controller.js';
import { validateJWT, requireRole } from '../Middleware/validate-jwt.js';

const router = Router();
router.use(validateJWT);

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Gestión de cuentas bancarias
 */

/**
 * @swagger
 * /accounts/create:
 *   post:
 *     summary: Crear una cuenta bancaria
 *     description: Crea una nueva cuenta bancaria para el usuario autenticado. Solo Admin y Cliente pueden crear cuentas.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountRequest'
 *     responses:
 *       201:
 *         description: Cuenta creada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Datos inválidos.
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
 *       403:
 *         description: El usuario no tiene el rol requerido (Admin o Cliente).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', requireRole('Admin', 'Cliente'), createAccount);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Obtener cuentas del usuario
 *     description: Retorna todas las cuentas bancarias asociadas al usuario autenticado.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Token JWT inválido o no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAccounts);

/**
 * @swagger
 * /accounts/deposit:
 *   post:
 *     summary: Realizar un depósito
 *     description: Deposita un monto en la cuenta bancaria especificada del usuario autenticado.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositWithdrawRequest'
 *     responses:
 *       200:
 *         description: Depósito realizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Monto inválido o cuenta no encontrada.
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
router.post('/deposit', deposit);

/**
 * @swagger
 * /accounts/withdraw:
 *   post:
 *     summary: Realizar un retiro
 *     description: Retira un monto de la cuenta bancaria especificada. Verifica saldo suficiente y límites de transacción.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositWithdrawRequest'
 *     responses:
 *       200:
 *         description: Retiro realizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Saldo insuficiente, monto inválido o límite excedido.
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
router.post('/withdraw', withdraw);

export default router;
