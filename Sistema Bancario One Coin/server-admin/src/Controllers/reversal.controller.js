import { Transaction } from "../Models/transaction.model.js";
import { Account } from "../Models/account.model.js";


export const updateDepositAmount = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (amount == null || amount <= 0) {
            return res.status(400).json({ message: "El nuevo monto debe ser mayor a 0" });
        }

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        if (transaction.type !== "DEPOSITO") {
            return res.status(400).json({ message: "Solo se puede editar el monto de depósitos" });
        }

        if (transaction.status === "REVERTIDA") {
            return res.status(400).json({ message: "No se puede editar un depósito ya revertido" });
        }

        const account = await Account.findById(transaction.destinationAccount);
        if (!account) throw new Error("Cuenta destino no encontrada");

        const diferencia = amount - transaction.amount;
        account.balance += diferencia;
        await account.save();

        transaction.amount = amount;
        await transaction.save();

        res.json({
            success: true,
            message: "Monto del depósito actualizado correctamente",
            transaction
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const reverseTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const original = await Transaction.findById(id);

        if (!original) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        if (original.status === "REVERTIDA") {
            return res.status(400).json({ message: "Esta transacción ya fue revertida" });
        }

        if (original.type === "DEPOSITO") {
            const msTranscurridos = Date.now() - new Date(original.date).getTime();
            const unMinutoEnMs = 60 * 1000;
            if (msTranscurridos > unMinutoEnMs) {
                return res.status(400).json({
                    message: "Este depósito ya no puede revertirse: pasó más de 1 minuto desde que se realizó."
                });
            }
        }

        if (original.type === "DEPOSITO") {
            const account = await Account.findById(original.destinationAccount);
            if (!account) throw new Error("Cuenta destino no encontrada");
            if (account.balance < original.amount) throw new Error("Fondos insuficientes para revertir el depósito");
            account.balance -= original.amount;
            await account.save();

        } else if (original.type === "RETIRO") {
            const account = await Account.findById(original.originAccount);
            if (!account) throw new Error("Cuenta origen no encontrada");
            account.balance += original.amount;
            await account.save();

        } else if (original.type === "TRANSFERENCIA") {
            const fromAccount = await Account.findById(original.originAccount);
            const toAccount   = await Account.findById(original.destinationAccount);
            if (!fromAccount || !toAccount) throw new Error("Una o ambas cuentas no encontradas");
            if (toAccount.balance < original.amount) throw new Error("Fondos insuficientes en la cuenta destino para revertir");
            fromAccount.balance += original.amount;
            toAccount.balance   -= original.amount;
            await fromAccount.save();
            await toAccount.save();
        }

        const reversal = await Transaction.create({
            type: original.type,
            amount: original.amount,
            originAccount: original.destinationAccount,      // invertidos
            destinationAccount: original.originAccount,
            status: "REVERTIDA"
        });

        original.status = "REVERTIDA";
        original.reversedBy = reversal._id;
        await original.save();

        res.json({
            success: true,
            message: "Transacción revertida correctamente",
            originalTransaction: original,
            reversalTransaction: reversal
        });

    } catch (error) {
        const status = error.message.includes("insuficientes") ? 400
            : error.message.includes("no encontrada") ? 404
            : 500;
        res.status(status).json({ message: error.message });
    }
};
