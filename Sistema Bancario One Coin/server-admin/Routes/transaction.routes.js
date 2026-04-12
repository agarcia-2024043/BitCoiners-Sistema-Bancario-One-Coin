import express from "express";
import {
  getTransactions,
  transfer,
} from "../Controllers/transaction.controller.js";
import { validateJWT, requireRole} from "../Middleware/validate-jwt.js";
import { reverseTransaction } from "../Controllers/reversal.controller.js";

const router = express.Router();

router.use(validateJWT);

router.get("/", validateJWT, getTransactions);
router.post("/transfer", validateJWT, transfer);
router.post("/:id/reverse", validateJWT, requireRole("Admin"), reverseTransaction);

export default router;
