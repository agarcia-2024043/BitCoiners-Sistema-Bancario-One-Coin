import express from "express";
import { getRates, convertCurrency } from "../Controllers/currency.controller.js";
import { validateJWT } from "../Middleware/validate-jwt.js";

const router = express.Router();
router.use(validateJWT);

router.get("/", validateJWT, getRates);
router.post("/convert", validateJWT, convertCurrency);

export default router;