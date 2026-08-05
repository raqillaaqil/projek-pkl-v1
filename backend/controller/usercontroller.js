import db from "../config/db.js";

export const getUsers = (req, res) => {
    db.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.role_id,
            roles.role_name AS role,
            users.photo
        FROM users
        JOIN roles
        ON users.role_id = roles.id`,
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

export const getUserById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT
            users.id,
            users.name,
            users.email,
            users.role_id,
            roles.role_name AS role,
            users.photo
        FROM users
        JOIN roles
        ON users.role_id = roles.id
        WHERE users.id = ?`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "User tidak ditemukan",
                });
            }

            res.json(result[0]);
        }
    );
};

export const updateUser = (
    req,
    res
) => {
    const { id } = req.params;

    const {
        name,
        email,
        role_id,
    } = req.body;

    db.query(
        "UPDATE users SET name=?, email=?, role_id=? WHERE id=?",
        [name, email, role_id, id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json({
                message: "User berhasil diupdate",
            });
        }
    );
};

export const deleteUser = (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM users WHERE id=?",
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json({
                message: "User berhasil dihapus",
            });
        }
    );
};

export const uploadPhoto = (
    req,
    res
) => {
    if (!req.file) {
        return res.status(400).json({
            message: "File tidak ditemukan",
        });
    }

    const { id } = req.params;

    db.query(
        "UPDATE users SET photo=? WHERE id=?",
        [req.file.filename, id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: err.message,
                });
            }

            res.json({
                message: "Upload berhasil",
                photo: req.file.filename,
            });
        }
    );
};