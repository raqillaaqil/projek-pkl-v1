const Barang = require("../models/barangModel");
const Peminjaman = require("../models/peminjamanModel");

// Daftar Peminjaman
exports.getPeminjaman = (req, res) => {

    Peminjaman.getAll((err, rows) => {

        if (err)
            return res.status(500).json(err);

        res.json(rows);

    });

};

// Detail
exports.getPeminjamanById = (req, res) => {

    Peminjaman.getById(req.params.id, (err, rows) => {

        if (err)
            return res.status(500).json(err);

        res.json(rows[0]);

    });

};

// Tambah
exports.tambahPeminjaman = (req, res) => {

    const data = req.body;

    Barang.getById(data.barang_id, (err, barang) => {

        if (err)
            return res.status(500).json(err);

        if (barang.length == 0)
            return res.status(404).json({
                success:false,
                message:"Barang tidak ditemukan"
            });

        if (barang[0].stok < data.jumlah_pinjam)
            return res.status(400).json({
                success:false,
                message:"Stok barang tidak mencukupi"
            });

        Peminjaman.create(data, (err, result)=>{

            if(err)
                return res.status(500).json(err);

            Barang.kurangiStok(
                data.barang_id,
                data.jumlah_pinjam,
                ()=>{}
            );

            res.status(201).json({
                success:true,
                message:"Peminjaman berhasil"
            });

        });

    });

};

// Edit
exports.editPeminjaman = (req,res)=>{

    Peminjaman.update(
        req.params.id,
        req.body,
        (err)=>{

            if(err)
                return res.status(500).json(err);

            res.json({
                success:true,
                message:"Data berhasil diubah"
            });

        }
    );

};

// Hapus
exports.hapusPeminjaman = (req,res)=>{

    Peminjaman.getById(req.params.id,(err,row)=>{

        if(err)
            return res.status(500).json(err);

        if(row.length==0)
            return res.status(404).json({
                message:"Data tidak ditemukan"
            });

        Barang.tambahStok(
            row[0].barang_id,
            row[0].jumlah_pinjam,
            ()=>{}
        );

        Peminjaman.delete(req.params.id,(err)=>{

            if(err)
                return res.status(500).json(err);

            res.json({
                success:true,
                message:"Peminjaman berhasil dihapus"
            });

        });

    });

};