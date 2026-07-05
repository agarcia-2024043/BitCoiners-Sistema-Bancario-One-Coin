// src/Routes/account.routes.js  — REEMPLAZA el archivo actual
import { Router } from 'express';
import { createAccount, getAccounts, getAccountsByMovements, deposit, withdraw } from '../Controllers/account.controller.js';
import { validateJWT, requireRole } from '../Middleware/validate-jwt.js';
import { Account } from '../Models/account.model.js';

const router = Router();
router.use(validateJWT);

/**
 * @swagger
 * /accounts/by-movements:
 *   get:
 *     summary: Obtener cuentas ordenadas por cantidad de movimientos
 *     description: Retorna todas las cuentas bancarias ordenadas por número de transacciones. Solo accesible para administradores.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de los resultados (ascendente o descendente).
 *     responses:
 *       200:
 *         description: Lista de cuentas ordenadas por movimientos.
 *       401:
 *         description: Token JWT inválido o no proporcionado.
 *       403:
 *         description: El usuario no tiene rol Admin.
 */
router.get('/by-movements', requireRole('Admin'), getAccountsByMovements);

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
 * /accounts/search:
 *   get:
 *     summary: Buscar cuenta por número
 *     description: Busca una cuenta bancaria de terceros mediante una consulta regex por número de cuenta para realizar transferencias. Excluye automáticamente las cuentas que pertenecen al usuario autenticado.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: El número o parte del número de cuenta a buscar (mínimo 3 caracteres).
 *     responses:
 *       200:
 *         description: Cuenta encontrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "641bf82e2f3d4a12c8e32b45"
 *                     accountNumber:
 *                       type: string
 *                       example: "ACC123456"
 *                     type:
 *                       type: string
 *                       example: "Ahorro"
 *       400:
 *         description: Query faltante o demasiado corta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cuenta no encontrada o pertenece al propio usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ message: "Ingresa al menos 3 caracteres para buscar" });
    }

    const account = await Account.findOne({
      accountNumber: { $regex: q.trim(), $options: 'i' },
      userId: { $ne: req.user.id }, // excluir cuentas propias
    }).select('accountNumber type userId name');

    if (!account) {
      return res.status(404).json({ message: "Cuenta no encontrada o es tuya propia" });
    }

    res.json({
      success: true,
      account: {
        _id: account._id,
        accountNumber: account.accountNumber,
        type: account.type,
        name: account.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar cuenta", error: error.message });
  }
});

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