import mongoose from "mongoose";
import { Account } from "../Models/account.model.js";
import { Transaction } from "../Models/transaction.model.js";
import { checkAndUpdateLimit } from "../Controllers/limit.controller.js";

// =====================================================
// DEPÓSITO ATÓMICO
// =====================================================
export const depositService = async (accountId, amount) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const account = await Account.findById(accountId).session(session);
        if (!account) throw new Error("Cuenta no encontrada");

        // Validar límites antes de operar
        await checkAndUpdateLimit(accountId, amount, session);

        account.balance += amount;
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [{ type: "DEPOSITO", amount, destinationAccount: accountId }],
            { session }
        );

        await session.commitTransaction();
        return { account, transaction };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// =====================================================
// RETIRO ATÓMICO
// =====================================================
export const withdrawService = async (accountId, amount) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const account = await Account.findById(accountId).session(session);
        if (!account) throw new Error("Cuenta no encontrada");

        if (account.balance < amount) {
            throw new Error(`Fondos insuficientes. Saldo actual: ${account.balance}`);
        }

        // Validar límites antes de operar
        await checkAndUpdateLimit(accountId, amount, session);

        account.balance -= amount;
        await account.save({ session });

        const [transaction] = await Transaction.create(
            [{ type: "RETIRO", amount, originAccount: accountId }],
            { session }
        );

        await session.commitTransaction();
        return { account, transaction };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// =====================================================
// TRANSFERENCIA ATÓMICA
// =====================================================
export const transferService = async (fromAccountId, toAccountId, amount, requestUserId, isAdmin) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const fromAccount = await Account.findById(fromAccountId).session(session);
        const toAccount   = await Account.findById(toAccountId).session(session);

        if (!fromAccount) throw new Error("La cuenta origen no existe");
        if (!toAccount)   throw new Error("La cuenta destino no existe");

        if (!isAdmin && fromAccount.userId !== requestUserId) {
            throw new Error("No tienes permiso sobre la cuenta origen");
        }

        if (fromAccount.balance < amount) {
            throw new Error(`Fondos insuficientes. Saldo actual: ${fromAccount.balance}`);
        }

        // Validar límites de la cuenta origen antes de transferir
        await checkAndUpdateLimit(fromAccountId, amount, session);

        fromAccount.balance -= amount;
        toAccount.balance   += amount;

        await fromAccount.save({ session });
        await toAccount.save({ session });

        const [transaction] = await Transaction.create(
            [{
                type: "TRANSFERENCIA",
                amount,
                originAccount: fromAccountId,
                destinationAccount: toAccountId
            }],
            { session }
        );

        await session.commitTransaction();
        return { fromAccount, toAccount, transaction };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};