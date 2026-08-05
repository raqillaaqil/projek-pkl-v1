import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, 2],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: err.message,
                    });
                }

                res.status(201).json({
                    message: "Register berhasil",
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const login = (req, res) => {
    const { email, password } = req.body;

    db.query(
        `
        SELECT
            users.*,
            roles.role_name AS role
        FROM users
        JOIN roles
            ON users.role_id = roles.id
        WHERE users.email = ?
        `,
        [email],
        async (err, result) => {
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

            const user = result[0];

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Password salah",
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d",
                }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
    );
};