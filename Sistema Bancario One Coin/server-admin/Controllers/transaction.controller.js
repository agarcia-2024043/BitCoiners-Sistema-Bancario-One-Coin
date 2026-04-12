import { Account } from "../Models/account.model.js";
import { Transaction } from "../Models/transaction.model.js";
import { transferService } from "../services/banking.service.js";

// Account sigue importado porque getTransactions lo usa para filtrar por usuario

// =====================================================
// HISTORIAL DE TRANSACCIONES
// =====================================================
export const getTransactions = async (req, res) => {
  try {
    const isAdmin = req.user.roles.includes("Admin");

    let transactions;

    if (isAdmin) {
      transactions = await Transaction.find()
        .populate("originAccount", "accountNumber")
        .populate("destinationAccount", "accountNumber")
        .sort({ date: -1 });
    } else {
      const userAccounts = await Account.find({ userId: req.user.id }).select("_id");
      const accountIds = userAccounts.map(a => a._id);

      transactions = await Transaction.find({
        $or: [
          { originAccount: { $in: accountIds } },
          { destinationAccount: { $in: accountIds } }
        ]
      })
        .populate("originAccount", "accountNumber")
        .populate("destinationAccount", "accountNumber")
        .sort({ date: -1 });
    }

    res.json({ success: true, total: transactions.length, transactions });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener transacciones", error: error.message });
  }
};

// =====================================================
// TRANSFERENCIA — usa banking.service (atómica)
// =====================================================
export const transfer = async (req, res) => {
  try {
    let { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ message: "fromAccountId, toAccountId y amount son obligatorios" });
    }

    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "El monto debe ser mayor a 0" });
    }

    // Pasamos userId e isAdmin al servicio para que haga la verificación
    // de ownership DENTRO de la sesión — evita la race condition de leer
    // la cuenta aquí y volver a leerla en el servicio con datos distintos
    const isAdmin = req.user.roles.includes("Admin");
    const result = await transferService(fromAccountId, toAccountId, amount, req.user.id, isAdmin);

    res.json({
      success: true,
      message: "Transferencia realizada correctamente",
      from: {
        accountNumber: result.fromAccount.accountNumber,
        newBalance: result.fromAccount.balance
      },
      to: {
        accountNumber: result.toAccount.accountNumber,
        newBalance: result.toAccount.balance
      },
      transaction: result.transaction
    });

  } catch (error) {
    const status = error.message.includes("Fondos insuficientes") ? 400
      : error.message.includes("no existe") ? 404
      : error.message.includes("permiso") ? 403
      : 500;
    res.status(status).json({ message: error.message });
  }
};