import { Limit } from "../Models/limit.model.js";
import { Account } from "../Models/account.model.js";

// Helper: resetear el acumulado diario si cambió el día
const resetDailyIfNeeded = async (limit) => {
    const today = new Date().toDateString();
    const lastReset = new Date(limit.lastResetDate).toDateString();
    if (today !== lastReset) {
        limit.dailyUsed = 0;
        limit.lastResetDate = new Date();
        await limit.save();
    }
    return limit;
};

// =====================================================
// GET /limits/:accountId — ver límites de una cuenta
// =====================================================
export const getLimits = async (req, res) => {
    try {
        const account = await Account.findById(req.params.accountId);
        if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });

        if (!req.user.roles.includes("Admin") && account.userId !== req.user.id) {
            return res.status(403).json({ message: "No tienes permiso sobre esta cuenta" });
        }

        let limit = await Limit.findOne({ accountId: req.params.accountId });
        if (!limit) return res.status(404).json({ message: "Esta cuenta no tiene límites configurados" });

        limit = await resetDailyIfNeeded(limit);

        res.json({ success: true, limit });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener límites", error: error.message });
    }
};

// =====================================================
// POST /limits — crear límites para una cuenta  (Admin)
// Body: { accountId, dailyLimit, perTransactionLimit }
// =====================================================
export const createLimits = async (req, res) => {
    try {
        const { accountId, dailyLimit, perTransactionLimit } = req.body;

        if (!accountId || dailyLimit == null || perTransactionLimit == null) {
            return res.status(400).json({ message: "accountId, dailyLimit y perTransactionLimit son obligatorios" });
        }

        const account = await Account.findById(accountId);
        if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });

        const existing = await Limit.findOne({ accountId });
        if (existing) return res.status(400).json({ message: "Esta cuenta ya tiene límites. Usa PUT para actualizarlos" });

        const limit = await Limit.create({ accountId, dailyLimit, perTransactionLimit });

        res.status(201).json({ success: true, message: "Límites creados", limit });
    } catch (error) {
        res.status(500).json({ message: "Error al crear límites", error: error.message });
    }
};

// =====================================================
// PUT /limits/:accountId — actualizar límites  (Admin)
// =====================================================
export const updateLimits = async (req, res) => {
    try {
        const { dailyLimit, perTransactionLimit } = req.body;

        if (dailyLimit == null && perTransactionLimit == null) {
            return res.status(400).json({ message: "Debes enviar al menos dailyLimit o perTransactionLimit" });
        }

        const updates = {};
        if (dailyLimit != null)            updates.dailyLimit = dailyLimit;
        if (perTransactionLimit != null)   updates.perTransactionLimit = perTransactionLimit;

        const limit = await Limit.findOneAndUpdate(
            { accountId: req.params.accountId },
            updates,
            { new: true }
        );

        if (!limit) return res.status(404).json({ message: "No se encontraron límites para esta cuenta" });

        res.json({ success: true, message: "Límites actualizados", limit });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar límites", error: error.message });
    }
};

// =====================================================
// DELETE /limits/:accountId — eliminar límites (Admin)
// =====================================================
export const deleteLimits = async (req, res) => {
    try {
        const limit = await Limit.findOneAndDelete({ accountId: req.params.accountId });

        if (!limit) return res.status(404).json({ message: "No se encontraron límites para esta cuenta" });

        res.json({ success: true, message: "Límites eliminados correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar límites", error: error.message });
    }
};

// =====================================================
// Función utilitaria exportada para usar en banking.service
// Valida y actualiza el acumulado diario antes de operar
// =====================================================
export const checkAndUpdateLimit = async (accountId, amount, session) => {
    const limit = await Limit.findOne({ accountId }).session(session);
    if (!limit) return;   // si no hay límites configurados, se permite la operación

    await resetDailyIfNeeded(limit);

    if (amount > limit.perTransactionLimit) {
        throw new Error(`El monto excede el límite por transacción (máx: ${limit.perTransactionLimit})`);
    }
    if (limit.dailyUsed + amount > limit.dailyLimit) {
        const disponible = limit.dailyLimit - limit.dailyUsed;
        throw new Error(`El monto excede el límite diario. Disponible hoy: ${disponible}`);
    }

    limit.dailyUsed += amount;
    await limit.save({ session });
};