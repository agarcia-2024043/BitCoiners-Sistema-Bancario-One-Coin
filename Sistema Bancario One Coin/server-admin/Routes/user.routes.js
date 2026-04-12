import express from "express";
import { createUser, getUsers } from "../Controllers/user.controller.js";
import { validateJWT, requireRole } from "../Middleware/validate-jwt.js";

const router = express.Router();

router.get("/", validateJWT, requireRole("Admin"), getUsers);
router.post("/", validateJWT, requireRole("Admin"), createUser);

export default router;