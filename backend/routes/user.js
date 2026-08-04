const express = require("express");
const router = express.Router();

const userController =
    require("../controllers/userController");

const auth =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");


// =================================
// PROFILE USER YANG SEDANG LOGIN
// =================================
router.get(
    "/profile",
    auth,
    userController.getProfile
);


// =================================
// UPLOAD FOTO PROFILE
// =================================
router.post(
    "/upload-photo",
    auth,
    upload.single("photo"),
    userController.uploadPhoto
);


// =================================
// GET SEMUA USER
// =================================
router.get(
    "/",
    auth,
    userController.getUsers
);


// =================================
// UPDATE USER
// =================================
router.put(
    "/:id",
    auth,
    userController.updateUser
);


// =================================
// HAPUS USER
// =================================
router.delete(
    "/:id",
    auth,
    userController.deleteUser
);


module.exports = router;