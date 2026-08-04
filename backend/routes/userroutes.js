import express from "express";
import upload from "../middleware/upload.js";

import {
  getUsers,
  updateUser,
  deleteUser,
  uploadPhoto,
  getUserById,
} from "../controller/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);

router.post(
  "/upload/:id",
  upload.single("photo"),
  uploadPhoto
);

export default router;