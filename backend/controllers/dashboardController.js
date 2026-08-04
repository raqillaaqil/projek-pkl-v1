const db = require("../config/db");

// =================================
// GET STATISTIK DASHBOARD
// =================================
exports.getStats = (req, res) => {

    const query = `
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,

            (SELECT COUNT(*) FROM barang) AS total_barang,

            (SELECT COUNT(*) FROM peminjaman)
            AS total_peminjaman
    `;

    db.query(
        query,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengambil statistik dashboard",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Statistik dashboard berhasil diambil",
                data: result[0]
            });

        }
    );

};