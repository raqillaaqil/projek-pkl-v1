import express from "express";
import upload from "../middleware/upload.js";

import {
  getUsers,
  getUsersList,
  createUser,
  updateUser,
  deleteUser,
  uploadPhoto,
  getUserById,
  archiveUser,
  restoreUser,
  trashUser,
  permanentDeleteUser,
  exportUsers,
} from "../controller/userController.js";

const router = express.Router();

// NOTE: route statis (/list, /export) HARUS didaftarkan sebelum route
// dinamis ("/:id") supaya tidak tertangkap sebagai id.

router.get("/", getUsers); // dipakai fitur lama, jangan diubah
router.get("/list", getUsersList); // dipakai halaman Kelola Pengguna
router.get("/export", exportUsers); // export Excel / CSV

router.post("/", createUser); // tombol "Tambah Pengguna"

router.put("/:id", updateUser);
router.delete("/:id/permanent", permanentDeleteUser); // hapus permanen dari Sampah
router.patch("/:id/archive", archiveUser); // Aktif -> Terarsip
router.patch("/:id/restore", restoreUser); // Terarsip/Sampah -> Aktif
router.patch("/:id/trash", trashUser); // Terarsip -> Sampah
router.delete("/:id", deleteUser); // dipertahankan agar fitur lama tidak rusak
router.get("/:id", getUserById);

router.post("/upload/:id", upload.single("photo"), uploadPhoto);

export default router;