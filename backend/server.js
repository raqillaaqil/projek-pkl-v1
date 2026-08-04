require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// =================================
// KONEKSI DATABASE
// =================================
require("./config/db");


// =================================
// MIDDLEWARE
// =================================
app.use(cors());

app.use(express.json());


// =================================
// AKSES FILE FOTO DI FOLDER UPLOADS
// =================================
app.use(
    "/uploads",
    express.static("uploads")
);


// =================================
// ROUTE UTAMA
// =================================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API Inventaris PKL Berjalan"
    });
});


// =================================
// ROUTES AUTH
// =================================
app.use(
    "/api/auth",
    require("./routes/auth")
);


// =================================
// ROUTES BARANG
// =================================
app.use(
    "/api/barang",
    require("./routes/barang")
);


// =================================
// ROUTES PEMINJAMAN
// =================================
app.use(
    "/api/peminjaman",
    require("./routes/peminjaman")
);


// =================================
// ROUTES USER
// =================================
app.use(
    "/api/users",
    require("./routes/user")
);


// =================================
// ROUTES DASHBOARD
// =================================
app.use(
    "/api/dashboard",
    require("./routes/dashboard")
);


// =================================
// 404 HANDLER
// HARUS SETELAH SEMUA ROUTE
// =================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});


// =================================
// ERROR HANDLER
// HARUS PALING BAWAH
// =================================
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server"
    });

});


// =================================
// JALANKAN SERVER
// =================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});