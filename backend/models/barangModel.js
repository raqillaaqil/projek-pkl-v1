const db = require("../config/db");

exports.getAll = (callback) => {
    db.query(
        "SELECT * FROM barang ORDER BY id DESC",
        callback
    );
};

exports.getById = (id, callback) => {
    db.query(
        "SELECT * FROM barang WHERE id=?",
        [id],
        callback
    );
};

exports.create = (data, callback) => {
    db.query(
        "INSERT INTO barang(nama_barang, stok) VALUES(?,?)",
        [data.nama_barang, data.stok],
        callback
    );
};

exports.update = (id, data, callback) => {
    db.query(
        "UPDATE barang SET nama_barang=?, stok=? WHERE id=?",
        [data.nama_barang, data.stok, id],
        callback
    );
};

exports.delete = (id, callback) => {
    db.query(
        "DELETE FROM barang WHERE id=?",
        [id],
        callback
    );
};

exports.cekDipinjam = (id, callback) => {
    db.query(
        "SELECT * FROM peminjaman WHERE barang_id=?",
        [id],
        callback
    );
};

exports.kurangiStok = (id, jumlah, callback) => {
    db.query(
        "UPDATE barang SET stok = stok - ? WHERE id=?",
        [jumlah, id],
        callback
    );
};

exports.tambahStok = (id, jumlah, callback) => {
    db.query(
        "UPDATE barang SET stok = stok + ? WHERE id=?",
        [jumlah, id],
        callback
    );
};