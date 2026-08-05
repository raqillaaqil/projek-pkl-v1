import express from "express";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
} from "../controller/roleController.js";

const router = express.Router();

router.get("/", getRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);
router.get("/:id", getRoleById);

export default router;