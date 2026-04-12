import express from "express";
import { getLimits, createLimits, updateLimits, deleteLimits } from "../Controllers/limit.controller.js";
import { validateJWT, requireRole } from "../Middleware/validate-jwt.js";

const router = express.Router();
router.use(validateJWT);

router.get("/:accountId", validateJWT, getLimits);
router.post("/", validateJWT, requireRole("Admin"), createLimits);
router.put("/:accountId", validateJWT, requireRole("Admin"), updateLimits);        // PUT  /limits/:accountId (Admin)
router.delete("/:accountId", validateJWT, requireRole("Admin"), deleteLimits);    // DELETE /limits/:accountId (Admin)

export default router;