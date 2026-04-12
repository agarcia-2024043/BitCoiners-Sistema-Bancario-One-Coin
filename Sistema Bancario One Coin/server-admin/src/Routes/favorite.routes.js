import express from "express";
import { getFavorites, addFavorite, updateFavorite, deleteFavorite } from "../Controllers/favorite.controller.js";
import { validateJWT } from "../Middleware/validate-jwt.js";

const router = express.Router();

router.get("/", validateJWT, getFavorites);
router.post("/", validateJWT, addFavorite);
router.put("/:id", validateJWT, updateFavorite);
router.delete("/:id", validateJWT, deleteFavorite);

export default router;