import db from "../config/db.js";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";

// Kolom yang boleh ditampilkan / diexport
const COLUMN_MAP = {
    username: { sql: "users.username", label: "Username" },
    nama_depan: { sql: "users.nama_depan", label: "Nama Depan" },
    nama_belakang: { sql: "users.nama_belakang", label: "Nama Belakang" },
    email: { sql: "users.email", label: "Email" },
    role: { sql: "roles.role_name", label: "Role" },
    perusahaan: { sql: "users.perusahaan", label: "Perusahaan" },
    no_telepon: { sql: "users.no_telepon", label: "Nomor Telepon" },
    status: { sql: "users.status", label: "Status" },
    created_at: { sql: "users.created_at", label: "Tanggal Dibuat" },
};

const SORTABLE_COLUMNS = {
    username: "users.username",
    nama_depan: "users.nama_depan",
    nama_belakang: "users.nama_belakang",
    email: "users.email",
    role: "roles.role_name",
    perusahaan: "users.perusahaan",
    no_telepon: "users.no_telepon",
    status: "users.status",
    created_at: "users.created_at",
};

const STATUS_LABEL = {
    active: "Aktif",
    archived: "Terarsip",
    trashed: "Sampah",
};

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
            users.username,
            users.name,
            users.nama_depan,
            users.nama_belakang,
            users.email,
            users.role_id,
            roles.role_name AS role,
            users.perusahaan,
            users.no_telepon,
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

export const updateUser = (req, res) => {
    const { id } = req.params;

    const {
        name,
        email,
        role_id,
        username,
        nama_depan,
        nama_belakang,
        perusahaan,
        no_telepon,
    } = req.body;

    // Kalau request datang dari halaman Kelola Pengguna (ada nama_depan),
    // update pakai kolom-kolom baru + tetap sinkronkan kolom "name" lama.
    if (nama_depan !== undefined) {
        const fullName = `${nama_depan} ${nama_belakang || ""}`.trim();

        db.query(
            `UPDATE users SET
                username=?, nama_depan=?, nama_belakang=?, name=?,
                email=?, role_id=?, perusahaan=?, no_telepon=?
             WHERE id=?`,
            [
                username,
                nama_depan,
                nama_belakang,
                fullName,
                email,
                role_id,
                perusahaan || null,
                no_telepon || null,
                id,
            ],
            (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: "User berhasil diupdate" });
            }
        );
        return;
    }

    // Kompatibilitas dengan form lama (UserTable.jsx di /admin) yang cuma
    // kirim name, email, role_id — TIDAK diubah.
    if (username !== undefined) {
        db.query(
            "UPDATE users SET name=?, email=?, role_id=?, username=? WHERE id=?",
            [name, email, role_id, username, id],
            (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: "User berhasil diupdate" });
            }
        );
        return;
    }

    db.query(
        "UPDATE users SET name=?, email=?, role_id=? WHERE id=?",
        [name, email, role_id, id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "User berhasil diupdate" });
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

// ================== KELOLA PENGGUNA ==================

// GET /api/users/list?status=active|archived|trashed&search=&sort_by=&sort_dir=&page=&per_page=
export const getUsersList = (req, res) => {
    const status = ["active", "archived", "trashed"].includes(req.query.status)
        ? req.query.status
        : "active";

    const search = (req.query.search || "").trim();
    const sortBy = SORTABLE_COLUMNS[req.query.sort_by] ? req.query.sort_by : "created_at";
    const sortDir = (req.query.sort_dir || "").toLowerCase() === "asc" ? "ASC" : "DESC";

    let page = parseInt(req.query.page, 10);
    let perPage = parseInt(req.query.per_page, 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (![10, 25, 50, 100].includes(perPage)) perPage = 10;

    const whereParts = ["users.status = ?"];
    const params = [status];

    if (search) {
        whereParts.push(
            "(users.username LIKE ? OR users.nama_depan LIKE ? OR users.nama_belakang LIKE ? OR users.email LIKE ? OR roles.role_name LIKE ?)"
        );
        const like = `%${search}%`;
        params.push(like, like, like, like, like);
    }

    // Filter spesifik dari panel "Filter Datatable" (terpisah dari search cepat)
    const {
        filter_username,
        filter_email,
        filter_nama_depan,
        filter_nama_belakang,
        filter_role_id,
        filter_date_from,
        filter_date_to,
    } = req.query;

    if (filter_username) {
        whereParts.push("users.username LIKE ?");
        params.push(`%${filter_username}%`);
    }
    if (filter_email) {
        whereParts.push("users.email LIKE ?");
        params.push(`%${filter_email}%`);
    }
    if (filter_nama_depan) {
        whereParts.push("users.nama_depan LIKE ?");
        params.push(`%${filter_nama_depan}%`);
    }
    if (filter_nama_belakang) {
        whereParts.push("users.nama_belakang LIKE ?");
        params.push(`%${filter_nama_belakang}%`);
    }
    if (filter_role_id) {
        whereParts.push("users.role_id = ?");
        params.push(filter_role_id);
    }
    if (filter_date_from) {
        whereParts.push("DATE(users.created_at) >= ?");
        params.push(filter_date_from);
    }
    if (filter_date_to) {
        whereParts.push("DATE(users.created_at) <= ?");
        params.push(filter_date_to);
    }

    const whereSql = `WHERE ${whereParts.join(" AND ")}`;
    const baseFrom = `FROM users JOIN roles ON users.role_id = roles.id ${whereSql}`;

    db.query(
        `SELECT
            SUM(status = 'active') AS active,
            SUM(status = 'archived') AS archived,
            SUM(status = 'trashed') AS trashed
        FROM users`,
        (countErr, countResult) => {
            if (countErr) return res.status(500).json({ message: countErr.message });

            const counts = {
                active: Number(countResult[0].active) || 0,
                archived: Number(countResult[0].archived) || 0,
                trashed: Number(countResult[0].trashed) || 0,
            };

            db.query(`SELECT COUNT(*) AS total ${baseFrom}`, params, (totalErr, totalResult) => {
                if (totalErr) return res.status(500).json({ message: totalErr.message });

                const total = totalResult[0].total;
                const totalPages = Math.max(1, Math.ceil(total / perPage));
                const offset = (page - 1) * perPage;

                db.query(
                    `SELECT
                        users.id, users.username, users.nama_depan, users.nama_belakang,
                        users.email, users.role_id, roles.role_name AS role,
                        users.perusahaan, users.no_telepon,
                        users.status, users.created_at, users.photo
                    ${baseFrom}
                    ORDER BY ${SORTABLE_COLUMNS[sortBy]} ${sortDir}
                    LIMIT ? OFFSET ?`,
                    [...params, perPage, offset],
                    (err, result) => {
                        if (err) return res.status(500).json({ message: err.message });

                        res.json({
                            data: result,
                            page,
                            per_page: perPage,
                            total,
                            total_pages: totalPages,
                            counts,
                        });
                    }
                );
            });
        }
    );
};

// POST /api/users  -> Tambah Pengguna
export const createUser = async (req, res) => {
    const {
        username,
        nama_depan,
        nama_belakang,
        email,
        password,
        role_id,
        perusahaan,
        no_telepon,
    } = req.body;

    if (!username || !nama_depan || !nama_belakang || !email || !password || !role_id) {
        return res.status(400).json({
            message:
                "Username, nama depan, nama belakang, email, password, dan role wajib diisi",
        });
    }

    // kolom "name" lama tetap diisi (gabungan nama depan+belakang) supaya
    // fitur Login/Register yang masih pakai kolom itu tidak rusak.
    const fullName = `${nama_depan} ${nama_belakang}`.trim();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            `INSERT INTO users
                (username, name, nama_depan, nama_belakang, email, password, role_id, perusahaan, no_telepon, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                username,
                fullName,
                nama_depan,
                nama_belakang,
                email,
                hashedPassword,
                role_id,
                perusahaan || null,
                no_telepon || null,
            ],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Username atau email sudah digunakan",
                        });
                    }
                    return res.status(500).json({ message: err.message });
                }

                res.status(201).json({
                    message: "Pengguna berhasil ditambahkan",
                    id: result.insertId,
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/users/:id/archive
export const archiveUser = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE users SET status='archived' WHERE id=? AND status='active'",
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Pengguna berhasil diarsipkan" });
        }
    );
};

// PATCH /api/users/:id/restore
export const restoreUser = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE users SET status='active' WHERE id=? AND status IN ('archived','trashed')",
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Pengguna berhasil dipulihkan" });
        }
    );
};

// PATCH /api/users/:id/trash
export const trashUser = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE users SET status='trashed' WHERE id=? AND status='archived'",
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Pengguna berhasil dipindahkan ke sampah" });
        }
    );
};

// DELETE /api/users/:id/permanent
export const permanentDeleteUser = (req, res) => {
    const { id } = req.params;
    db.query(
        "DELETE FROM users WHERE id=? AND status='trashed'",
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Pengguna tidak ditemukan di Sampah atau sudah dihapus" });
            }
            res.json({ message: "Pengguna berhasil dihapus permanen" });
        }
    );
};

// GET /api/users/export?format=excel|csv&status=&search=&sort_by=&sort_dir=&columns=
export const exportUsers = async (req, res) => {
    const status = ["active", "archived", "trashed"].includes(req.query.status)
        ? req.query.status
        : "active";

    const search = (req.query.search || "").trim();
    const sortBy = SORTABLE_COLUMNS[req.query.sort_by] ? req.query.sort_by : "created_at";
    const sortDir = (req.query.sort_dir || "").toLowerCase() === "asc" ? "ASC" : "DESC";
    const format = req.query.format === "csv" ? "csv" : "excel";

    const requestedColumns = (req.query.columns || "")
        .split(",")
        .map((c) => c.trim())
        .filter((c) => COLUMN_MAP[c]);

    const columns = requestedColumns.length ? requestedColumns : Object.keys(COLUMN_MAP);

    const whereParts = ["users.status = ?"];
    const params = [status];

    if (search) {
        whereParts.push(
            "(users.username LIKE ? OR users.nama_depan LIKE ? OR users.nama_belakang LIKE ? OR users.email LIKE ? OR roles.role_name LIKE ?)"
        );
        const like = `%${search}%`;
        params.push(like, like, like, like, like);
    }

    const selectSql = columns.map((c) => `${COLUMN_MAP[c].sql} AS ${c}`).join(", ");

    db.query(
        `SELECT ${selectSql}
        FROM users JOIN roles ON users.role_id = roles.id
        WHERE ${whereParts.join(" AND ")}
        ORDER BY ${SORTABLE_COLUMNS[sortBy]} ${sortDir}`,
        params,
        async (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });

            const headers = columns.map((c) => COLUMN_MAP[c].label);
            const fileBaseName = `kelola-pengguna-${status}`;

            const formatRow = (row) =>
                columns.map((c) => {
                    if (c === "status") return STATUS_LABEL[row[c]] || row[c];
                    if (c === "created_at" && row[c]) {
                        return new Date(row[c]).toISOString().slice(0, 19).replace("T", " ");
                    }
                    return row[c] ?? "";
                });

            if (format === "csv") {
                const escapeCsv = (val) => {
                    const str = String(val ?? "");
                    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
                    return str;
                };

                const lines = [
                    headers.map(escapeCsv).join(","),
                    ...rows.map((row) => formatRow(row).map(escapeCsv).join(",")),
                ];

                res.setHeader("Content-Type", "text/csv; charset=utf-8");
                res.setHeader("Content-Disposition", `attachment; filename="${fileBaseName}.csv"`);
                res.send("\uFEFF" + lines.join("\n"));
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Kelola Pengguna");
            sheet.addRow(headers);
            sheet.getRow(1).font = { bold: true };
            rows.forEach((row) => sheet.addRow(formatRow(row)));
            sheet.columns.forEach((col) => { col.width = 22; });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", `attachment; filename="${fileBaseName}.xlsx"`);

            await workbook.xlsx.write(res);
            res.end();
        }
    );
};

export const uploadPhoto = (req, res) => {
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