const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const peminjamanController = require("../controllers/peminjamanController");

router.get("/", auth, peminjamanController.getPeminjaman);

router.get("/:id", auth, peminjamanController.getPeminjamanById);

router.post("/", auth, peminjamanController.tambahPeminjaman);

router.put("/:id", auth, peminjamanController.editPeminjaman);

router.delete("/:id", auth, peminjamanController.hapusPeminjaman);

module.exports = router;