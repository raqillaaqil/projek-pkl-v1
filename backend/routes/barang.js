const express = require("express");
const router = express.Router();

const barangController = require("../controllers/barangController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, barangController.getBarang);
router.get("/:id", auth, barangController.getBarangById);

router.post("/", auth, barangController.tambahBarang);

router.put("/:id", auth, barangController.editBarang);

router.delete("/:id", auth, barangController.hapusBarang);

module.exports = router;