require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Koneksi Database
require("./config/db");

// Middleware
app.use(cors());
app.use(express.json());

// Agar file foto di folder uploads bisa diakses
app.use("/uploads", express.static("uploads"));

// Route utama
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Inventaris PKL Berjalan"
    });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/barang", require("./routes/barang"));

app.use("/api/users", require("./routes/user"));
app.use("/api/dashboard", require("./routes/dashboard"));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server"
    });
});

// Jalankan Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});