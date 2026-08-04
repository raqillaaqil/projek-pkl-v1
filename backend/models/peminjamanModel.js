const db = require("../config/db");

exports.getAll = (callback) => {
    db.query(
        `SELECT
            p.*,
            b.nama_barang
        FROM peminjaman p
        JOIN barang b
        ON p.barang_id=b.id
        ORDER BY p.id DESC`,
        callback
    );
};

exports.getById = (id, callback) => {
    db.query(
        "SELECT * FROM peminjaman WHERE id=?",
        [id],
        callback
    );
};

exports.create = (data, callback) => {
    db.query(
        `INSERT INTO peminjaman
        (barang_id,nama_peminjam,jumlah_pinjam,tanggal_pinjam)
        VALUES(?,?,?,NOW())`,
        [
            data.barang_id,
            data.nama_peminjam,
            data.jumlah_pinjam
        ],
        callback
    );
};

exports.update = (id, data, callback) => {
    db.query(
        `UPDATE peminjaman
        SET nama_peminjam=?, jumlah_pinjam=?
        WHERE id=?`,
        [
            data.nama_peminjam,
            data.jumlah_pinjam,
            id
        ],
        callback
    );
};

exports.delete = (id, callback) => {
    db.query(
        "DELETE FROM peminjaman WHERE id=?",
        [id],
        callback
    );
};