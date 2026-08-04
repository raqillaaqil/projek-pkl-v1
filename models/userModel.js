const db = require("../config/db");

exports.getUserByUsername = (username, callback) => {
    db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        callback
    );
};

exports.createUser = (data, callback) => {
    db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [data.username, data.password],
        callback
    );
};

exports.getAllUser = (callback) => {
    db.query("SELECT id, username, created_at FROM users", callback);
};