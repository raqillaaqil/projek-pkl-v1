const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username dan password wajib diisi"
        });
    }

    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, result) => {

            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                return res.status(400).json({
                    message: "Username sudah digunakan"
                });
            }

            const hashPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users(username, password) VALUES (?, ?)",
                [username, hashPassword],
                (err) => {

                    if (err) return res.status(500).json(err);

                    res.json({
                        message: "Register berhasil"
                    });

                }
            );

        }
    );
};


// LOGIN

exports.login = (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, result) => {

            if (err) return res.status(500).json(err);

            if (result.length === 0) {
                return res.status(401).json({
                    message: "Username tidak ditemukan"
                });
            }

            const user = result[0];

            const cocok = await bcrypt.compare(password, user.password);

            if (!cocok) {
                return res.status(401).json({
                    message: "Password salah"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            res.json({
                message: "Login berhasil",
                token
            });

        }
    );
};