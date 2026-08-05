import db from "../config/db.js";

export const getRoles = (req, res) => {
    db.query(
        "SELECT * FROM roles",
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json(result);
        }
    );
};

export const createRole = (req, res) => {
    const { role_name } = req.body;

    db.query(
        "INSERT INTO roles (role_name) VALUES (?)",
        [role_name],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json({
                message: "Role berhasil ditambahkan",
            });
        }
    );
};

export const updateRole = (req, res) => {
    const { id } = req.params;
    const { role_name } = req.body;

    db.query(
        "UPDATE roles SET role_name=? WHERE id=?",
        [role_name, id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json({
                message: "Role berhasil diupdate",
            });
        }
    );
};

export const deleteRole = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT COUNT(*) AS total FROM users WHERE role_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            if (result[0].total > 0) {
                return res.status(400).json({
                    message: "Role masih digunakan oleh user.",
                });
            }

            db.query(
                "DELETE FROM roles WHERE id = ?",
                [id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: err.message,
                        });
                    }

                    res.json({
                        message: "Role berhasil dihapus",
                    });
                }
            );
        }
    );
};

export const getRoleById = (req, res) => {
    db.query(
        "SELECT * FROM roles WHERE id=?",
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json(result[0]);
        }
    );
};