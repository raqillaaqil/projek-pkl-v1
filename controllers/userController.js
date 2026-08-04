const db = require("../config/db");

// =================================
// GET PROFILE USER YANG LOGIN
// =================================
exports.getProfile = (req, res) => {
    const userId = req.user.id;

    db.query(
        `SELECT id, username, photo 
         FROM users 
         WHERE id = ?`,
        [userId],
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
                    message: "User tidak ditemukan"
                });
            }

            res.status(200).json({
                success: true,
                message: "Profile berhasil diambil",
                data: result[0]
            });

        }
    );
};


// =================================
// UPLOAD FOTO PROFILE
// =================================
exports.uploadPhoto = (req, res) => {

    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Foto belum dipilih"
        });
    }

    const namaFoto = req.file.filename;

    db.query(
        "UPDATE users SET photo = ? WHERE id = ?",
        [namaFoto, userId],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User tidak ditemukan"
                });
            }

            res.status(200).json({
                success: true,
                message: "Foto profile berhasil diupload",
                photo: namaFoto
            });

        }
    );
};


// =================================
// GET SEMUA USER
// =================================
exports.getUsers = (req, res) => {

    db.query(
        `SELECT id, username, photo
         FROM users
         ORDER BY id DESC`,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Data user berhasil diambil",
                total: result.length,
                data: result
            });

        }
    );
};


// =================================
// UPDATE USER
// =================================
exports.updateUser = (req, res) => {

    const id = req.params.id;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Username wajib diisi"
        });
    }

    db.query(
        "SELECT * FROM users WHERE id = ?",
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
                    message: "User tidak ditemukan"
                });
            }

            db.query(
                "UPDATE users SET username = ? WHERE id = ?",
                [username, id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "User berhasil diupdate"
                    });

                }
            );

        }
    );
};


// =================================
// HAPUS USER
// =================================
exports.deleteUser = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM users WHERE id = ?",
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
                    message: "User tidak ditemukan"
                });
            }

            db.query(
                "DELETE FROM users WHERE id = ?",
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
                        message: "User berhasil dihapus"
                    });

                }
            );

        }
    );
};