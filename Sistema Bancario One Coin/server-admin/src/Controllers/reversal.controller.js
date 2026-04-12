import mongoose from "mongoose";
import { Transaction } from "../Models/transaction.model.js";
import { Account } from "../Models/account.model.js";

// =====================================================
// REVERTIR TRANSACCIÓN  (solo Admin)
// POST /transactions/:id/reverse
// =====================================================
export const reverseTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const original = await Transaction.findById(id).session(session);

        if (!original) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        if (original.status === "REVERTIDA") {
            await session.abortTransaction();
            return res.status(400).json({ message: "Esta transacción ya fue revertida" });
        }

        // Revertir los balances según el tipo original
        if (original.type === "DEPOSITO") {
            const account = await Account.findById(original.destinationAccount).session(session);
            if (!account) throw new Error("Cuenta destino no encontrada");
            if (account.balance < original.amount) throw new Error("Fondos insuficientes para revertir el depósito");
            account.balance -= original.amount;
            await account.save({ session });

        } else if (original.type === "RETIRO") {
            const account = await Account.findById(original.originAccount).session(session);
            if (!account) throw new Error("Cuenta origen no encontrada");
            account.balance += original.amount;
            await account.save({ session });

        } else if (original.type === "TRANSFERENCIA") {
            const fromAccount = await Account.findById(original.originAccount).session(session);
            const toAccount   = await Account.findById(original.destinationAccount).session(session);
            if (!fromAccount || !toAccount) throw new Error("Una o ambas cuentas no encontradas");
            if (toAccount.balance < original.amount) throw new Error("Fondos insuficientes en la cuenta destino para revertir");
            fromAccount.balance += original.amount;
            toAccount.balance   -= original.amount;
            await fromAccount.save({ session });
            await toAccount.save({ session });
        }

        // Crear transacción de reversión como registro
        const [reversal] = await Transaction.create([{
            type: original.type,
            amount: original.amount,
            originAccount: original.destinationAccount,      // invertidos
            destinationAccount: original.originAccount,
            status: "REVERTIDA"
        }], { session });

        // Marcar la original como revertida
        original.status = "REVERTIDA";
        original.reversedBy = reversal._id;
        await original.save({ session });

        await session.commitTransaction();

        res.json({
            success: true,
            message: "Transacción revertida correctamente",
            originalTransaction: original,
            reversalTransaction: reversal
        });

    } catch (error) {
        await session.abortTransaction();
        const status = error.message.includes("insuficientes") ? 400
            : error.message.includes("no encontrada") ? 404
            : 500;
        res.status(status).json({ message: error.message });
    } finally {
        session.endSession();
    }
};