import { Account } from "../Models/account.model.js";
import { Transaction } from "../Models/transaction.model.js";
import { checkAndUpdateLimit } from "../Controllers/limit.controller.js";


export const depositService = async (accountId, amount) => {
    const account = await Account.findById(accountId);
    if (!account) throw new Error("Cuenta no encontrada");

    // Validar límites antes de operar
    await checkAndUpdateLimit(accountId, amount);

    account.balance += amount;
    await account.save();

    const transaction = await Transaction.create({
        type: "DEPOSITO",
        amount,
        destinationAccount: accountId
    });

    return { account, transaction };
};


export const withdrawService = async (accountId, amount) => {
    const account = await Account.findById(accountId);
    if (!account) throw new Error("Cuenta no encontrada");

    if (account.balance < amount) {
        throw new Error(`Fondos insuficientes. Saldo actual: ${account.balance}`);
    }

    await checkAndUpdateLimit(accountId, amount);

    account.balance -= amount;
    await account.save();

    const transaction = await Transaction.create({
        type: "RETIRO",
        amount,
        originAccount: accountId
    });

    return { account, transaction };
};

export const transferService = async (fromAccountId, toAccountId, amount, requestUserId, isAdmin) => {
    const fromAccount = await Account.findById(fromAccountId);
    const toAccount   = await Account.findById(toAccountId);

    if (!fromAccount) throw new Error("La cuenta origen no existe");
    if (!toAccount)   throw new Error("La cuenta destino no existe");

    if (!isAdmin && fromAccount.userId !== requestUserId) {
        throw new Error("No tienes permiso sobre la cuenta origen");
    }

    if (fromAccount.balance < amount) {
        throw new Error(`Fondos insuficientes. Saldo actual: ${fromAccount.balance}`);
    }

    await checkAndUpdateLimit(fromAccountId, amount);

    fromAccount.balance -= amount;
    toAccount.balance   += amount;

    await fromAccount.save();
    await toAccount.save();

    const transaction = await Transaction.create({
        type: "TRANSFERENCIA",
        amount,
        originAccount: fromAccountId,
        destinationAccount: toAccountId
    });

    return { fromAccount, toAccount, transaction };
};
