const multer = require("multer");
const path = require("path");

// =================================
// PENGATURAN PENYIMPANAN FOTO
// =================================
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const namaFile =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname);

        cb(null, namaFile);

    }

});


// =================================
// FILTER FILE
// =================================
const fileFilter = (req, file, cb) => {

    const tipeFile = [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ];

    if (tipeFile.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "File harus berupa gambar JPG, JPEG, atau PNG"
            ),
            false
        );
    }

};


// =================================
// KONFIGURASI MULTER
// =================================
const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

});

module.exports = upload;