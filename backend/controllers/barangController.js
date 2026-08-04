const db = require("../config/db");

// ===========================
// GET ALL BARANG
// ===========================
exports.getBarang = (req, res) => {

    db.query(
        "SELECT * FROM barang ORDER BY id DESC",
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengambil data barang",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Data barang berhasil diambil",
                total: result.length,
                data: result
            });

        }
    );

};

// ===========================
// GET BARANG BY ID
// ===========================
exports.getBarangById = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM barang WHERE id=?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Barang tidak ditemukan"
                });
            }

            res.status(200).json({
                success: true,
                data: result[0]
            });

        }
    );

};

// ===========================
// TAMBAH BARANG
// ===========================
exports.tambahBarang = (req, res) => {

    const { nama_barang, stok } = req.body;

    if (!nama_barang || stok === undefined) {
        return res.status(400).json({
            success: false,
            message: "Nama barang dan stok wajib diisi"
        });
    }

    if (stok < 0) {
        return res.status(400).json({
            success: false,
            message: "Stok tidak boleh kurang dari 0"
        });
    }

    db.query(
        "INSERT INTO barang (nama_barang, stok) VALUES (?, ?)",
        [nama_barang, stok],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Barang berhasil ditambahkan",
                id: result.insertId
            });

        }
    );

};

// ===========================
// EDIT BARANG
// ===========================
exports.editBarang = (req, res) => {

    const id = req.params.id;
    const { nama_barang, stok } = req.body;

    if (!nama_barang || stok === undefined) {
        return res.status(400).json({
            success: false,
            message: "Nama barang dan stok wajib diisi"
        });
    }

    db.query(
        "SELECT * FROM barang WHERE id=?",
        [id],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Barang tidak ditemukan"
                });
            }

            db.query(
                "UPDATE barang SET nama_barang=?, stok=? WHERE id=?",
                [nama_barang, stok, id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "Barang berhasil diupdate"
                    });

                }
            );

        }
    );

};

// ===========================
// HAPUS BARANG
// ===========================
exports.hapusBarang = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM barang WHERE id=?",
        [id],
        (err, barang) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (barang.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Barang tidak ditemukan"
                });
            }

            db.query(
                "SELECT * FROM peminjaman WHERE barang_id=?",
                [id],
                (err, pinjam) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    if (pinjam.length > 0) {
                        return res.status(400).json({
                            success: false,
                            message: "Barang tidak bisa dihapus karena sudah dipinjam"
                        });
                    }

                    db.query(
                        "DELETE FROM barang WHERE id=?",
                        [id],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: err.message
                                });
                            }

                            res.status(200).json({
                                success: true,
                                message: "Barang berhasil dihapus"
                            });

                        }
                    );
                    

                }
            );

        }
    );

};