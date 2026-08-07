import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const API_BASE = "http://localhost:5000/api/users";
const ROLES_API = "http://localhost:5000/api/roles";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Kolom yang bisa ditampilkan/disembunyikan lewat tombol "Columns".
// (No dan Aksi selalu tampil, tidak termasuk daftar ini.)
const ALL_COLUMNS = [
    { key: "username", label: "Username" },
    { key: "nama_depan", label: "Nama Depan" },
    { key: "nama_belakang", label: "Nama Belakang" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "perusahaan", label: "Perusahaan" },
    { key: "no_telepon", label: "Nomor Telepon" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Tanggal Dibuat" },
];

const COLUMNS_STORAGE_KEY = "kelolaPengguna.visibleColumns";

const TABS = [
    { key: "active", label: "Aktif" },
    { key: "archived", label: "Terarsip" },
    { key: "trashed", label: "Sampah" },
];

const STATUS_BADGE = {
    active: "bg-green-100 text-green-700",
    archived: "bg-yellow-100 text-yellow-700",
    trashed: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
    active: "Aktif",
    archived: "Terarsip",
    trashed: "Sampah",
};

function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

function loadVisibleColumns() {
    try {
        const raw = localStorage.getItem(COLUMNS_STORAGE_KEY);
        if (!raw) return ALL_COLUMNS.map((c) => c.key);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
        // abaikan, pakai default
    }
    return ALL_COLUMNS.map((c) => c.key);
}

function KelolaPengguna() {
    const [tab, setTab] = useState("active");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 400);

    const [sortBy, setSortBy] = useState("created_at");
    const [sortDir, setSortDir] = useState("desc");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({ active: 0, archived: 0, trashed: 0 });
    const [loading, setLoading] = useState(false);

    const [roles, setRoles] = useState([]);

    const [visibleColumns, setVisibleColumns] = useState(loadVisibleColumns);
    const [showColumnsMenu, setShowColumnsMenu] = useState(false);
    const columnsMenuRef = useRef(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        username: "",
        nama_depan: "",
        nama_belakang: "",
        email: "",
        password: "",
        role_id: "",
        perusahaan: "",
        no_telepon: "",
    });
    const [addError, setAddError] = useState("");

    const [editingUser, setEditingUser] = useState(null);
    const [editError, setEditError] = useState("");

    const emptyFilters = {
        username: "",
        email: "",
        nama_depan: "",
        nama_belakang: "",
        role_id: "",
        date_from: "",
        date_to: "",
    };
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filterForm, setFilterForm] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

    const handleApplyFilter = () => {
        setAppliedFilters({ ...filterForm });
        setPage(1);
    };

    const handleResetFilter = () => {
        setFilterForm(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    };

    useEffect(() => {
        document.title = "Kelola Pengguna";
    }, []);

    // reset ke halaman 1 setiap kali tab / search / perPage berubah
    useEffect(() => {
        setPage(1);
    }, [tab, debouncedSearch, perPage]);

    useEffect(() => {
        fetch(ROLES_API)
            .then((res) => res.json())
            .then((data) => setRoles(data))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        localStorage.setItem(
            COLUMNS_STORAGE_KEY,
            JSON.stringify(visibleColumns)
        );
    }, [visibleColumns]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                columnsMenuRef.current &&
                !columnsMenuRef.current.contains(e.target)
            ) {
                setShowColumnsMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUsers = () => {
        setLoading(true);

        const params = new URLSearchParams({
            status: tab,
            search: debouncedSearch,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: String(page),
            per_page: String(perPage),
            filter_username: appliedFilters.username,
            filter_email: appliedFilters.email,
            filter_nama_depan: appliedFilters.nama_depan,
            filter_nama_belakang: appliedFilters.nama_belakang,
            filter_role_id: appliedFilters.role_id,
            filter_date_from: appliedFilters.date_from,
            filter_date_to: appliedFilters.date_to,
        });

        fetch(`${API_BASE}/list?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setRows(data.data || []);
                setTotal(data.total || 0);
                setTotalPages(data.total_pages || 1);
                setCounts(
                    data.counts || { active: 0, archived: 0, trashed: 0 }
                );
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, debouncedSearch, sortBy, sortDir, page, perPage, appliedFilters]);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortDir("asc");
        }
    };

    const toggleColumn = (key) => {
        setVisibleColumns((prev) =>
            prev.includes(key)
                ? prev.filter((c) => c !== key)
                : [...prev, key]
        );
    };

    const handleExport = (format) => {
        const params = new URLSearchParams({
            format,
            status: tab,
            search: debouncedSearch,
            sort_by: sortBy,
            sort_dir: sortDir,
            columns: visibleColumns.join(","),
            filter_username: appliedFilters.username,
            filter_email: appliedFilters.email,
            filter_nama_depan: appliedFilters.nama_depan,
            filter_nama_belakang: appliedFilters.nama_belakang,
            filter_role_id: appliedFilters.role_id,
            filter_date_from: appliedFilters.date_from,
            filter_date_to: appliedFilters.date_to,
        });

        const url = `${API_BASE}/export?${params.toString()}`;

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Export gagal");
                return res.blob();
            })
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `kelola-pengguna-${tab}.${format === "csv" ? "csv" : "xlsx"
                    }`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch((err) => {
                console.log(err);
                alert("Export gagal, silakan coba lagi.");
            });
    };

    const refreshAfterAction = () => {
        fetchUsers();
    };

    const handleArchive = async (id) => {
        if (!confirm("Arsipkan pengguna ini?")) return;
        await fetch(`${API_BASE}/${id}/archive`, { method: "PATCH" });
        refreshAfterAction();
    };

    const handleRestore = async (id) => {
        if (!confirm("Pulihkan pengguna ini?")) return;
        await fetch(`${API_BASE}/${id}/restore`, { method: "PATCH" });
        refreshAfterAction();
    };

    const handleTrash = async (id) => {
        if (!confirm("Pindahkan pengguna ini ke Sampah?")) return;
        await fetch(`${API_BASE}/${id}/trash`, { method: "PATCH" });
        refreshAfterAction();
    };



    const handlePermanentDelete = async (id) => {
        if (
            !confirm(
                "Data akan dihapus PERMANEN dari database dan tidak bisa dikembalikan. Lanjutkan?"
            )
        )
            return;
        await fetch(`${API_BASE}/${id}/permanent`, { method: "DELETE" });

        refreshAfterAction();
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddError("");

        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();

            if (!res.ok) {
                setAddError(data.message || "Gagal menambahkan pengguna");
                return;
            }

            setShowAddModal(false);
            setAddForm({
                username: "",
                nama_depan: "",
                nama_belakang: "",
                email: "",
                password: "",
                role_id: "",
                perusahaan: "",
                no_telepon: "",
            });
            setTab("active");
            refreshAfterAction();
        } catch (err) {
            setAddError("Gagal menambahkan pengguna");
            console.log(err);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError("");

        try {
            const res = await fetch(`${API_BASE}/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingUser),
            });

            if (!res.ok) {
                const data = await res.json();
                setEditError(data.message || "Gagal menyimpan perubahan");
                return;
            }

            setEditingUser(null);
            refreshAfterAction();
        } catch (err) {
            setEditError("Gagal menyimpan perubahan");
            console.log(err);
        }
    };

    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    const pageNumbers = useMemo(() => {
        const maxButtons = 5;
        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        start = Math.max(1, end - maxButtons + 1);

        const arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    const SortIcon = ({ column }) => {
        if (sortBy !== column) {
            return <span className="text-gray-300">⇅</span>;
        }
        return <span>{sortDir === "asc" ? "↑" : "↓"}</span>;
    };

    return (
        <div className="flex min-h-screen bg-zinc-100">
            <Sidebar />

            <div className="flex-1 p-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Link to="/admin" className="hover:underline">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-gray-700 font-medium">
                        Kelola Pengguna
                    </span>
                </div>

                <h1 className="text-3xl font-bold mb-6">Kelola Pengguna</h1>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                            + Tambah Pengguna
                        </button>

                        <div className="flex gap-4 text-sm font-medium">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={
                                        tab === t.key
                                            ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                                            : "text-gray-500 hover:text-gray-700 pb-1"
                                    }
                                >
                                    {t.label.toUpperCase()} ({counts[t.key] ?? 0})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari username, nama, email, atau role..."
                                className="border rounded-lg px-3 py-2 w-full sm:w-80"
                            />

                            <button
                                onClick={() => setShowFilterPanel((s) => !s)}
                                className={`border rounded-lg px-3 py-2 text-sm font-medium ${showFilterPanel
                                        ? "bg-blue-50 border-blue-400 text-blue-700"
                                        : "hover:bg-gray-50"
                                    }`}
                            >
                                Filter
                                {Object.values(appliedFilters).some(
                                    (v) => v
                                ) && (
                                        <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-blue-600 align-middle" />
                                    )}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative" ref={columnsMenuRef}>
                                <button
                                    onClick={() =>
                                        setShowColumnsMenu((s) => !s)
                                    }
                                    className="border rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                >
                                    Columns
                                </button>

                                {showColumnsMenu && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-20 p-2">
                                        {ALL_COLUMNS.map((col) => (
                                            <label
                                                key={col.key}
                                                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.includes(
                                                        col.key
                                                    )}
                                                    onChange={() =>
                                                        toggleColumn(col.key)
                                                    }
                                                />
                                                {col.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleExport("excel")}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 text-sm font-medium"
                            >
                                Excel
                            </button>

                            <button
                                onClick={() => handleExport("csv")}
                                className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-3 py-2 text-sm font-medium"
                            >
                                CSV
                            </button>

                            <div className="flex items-center gap-2 text-sm">
                                <span>Tampilkan</span>
                                <select
                                    value={perPage}
                                    onChange={(e) =>
                                        setPerPage(Number(e.target.value))
                                    }
                                    className="border rounded-lg px-2 py-2"
                                >
                                    {PER_PAGE_OPTIONS.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                               <span>data</span>
                            </div>
                        </div>
                    </div>

                    {showFilterPanel && (
                        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                            <h3 className="font-semibold mb-3 text-sm">
                                Filter Data
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={filterForm.username}
                                        onChange={(e) =>
                                            setFilterForm({
                                                ...filterForm,
                                                username: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        value={filterForm.email}
                                        onChange={(e) =>
                                            setFilterForm({
                                                ...filterForm,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Nama Depan
                                    </label>
                                    <input
                                        type="text"
                                        value={filterForm.nama_depan}
                                        onChange={(e) =>
                                            setFilterForm({
                                                ...filterForm,
                                                nama_depan: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Nama Belakang
                                    </label>
                                    <input
                                        type="text"
                                        value={filterForm.nama_belakang}
                                        onChange={(e) =>
                                            setFilterForm({
                                                ...filterForm,
                                                nama_belakang: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={filterForm.role_id}
                                        onChange={(e) =>
                                            setFilterForm({
                                                ...filterForm,
                                                role_id: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="">Semua Role</option>
                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.role_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Tanggal Dibuat
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={filterForm.date_from}
                                            onChange={(e) =>
                                                setFilterForm({
                                                    ...filterForm,
                                                    date_from: e.target.value,
                                                })
                                            }
                                            className="w-full border rounded-lg px-2 py-2 text-sm"
                                        />
                                        <span className="text-gray-400 text-xs">
                                            s/d
                                        </span>
                                        <input
                                            type="date"
                                            value={filterForm.date_to}
                                            onChange={(e) =>
                                                setFilterForm({
                                                    ...filterForm,
                                                    date_to: e.target.value,
                                                })
                                            }
                                            className="w-full border rounded-lg px-2 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleApplyFilter}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    Filter
                                </button>
                                <button
                                    onClick={handleResetFilter}
                                    className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-3 py-2 font-semibold">
                                        No
                                    </th>

                                    {ALL_COLUMNS.filter((c) =>
                                        visibleColumns.includes(c.key)
                                    ).map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() =>
                                                handleSort(col.key)
                                            }
                                            className="px-3 py-2 font-semibold cursor-pointer select-none whitespace-nowrap"
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                {col.label}
                                                <SortIcon column={col.key} />
                                            </span>
                                        </th>
                                    ))}

                                    <th className="px-3 py-2 font-semibold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={
                                                visibleColumns.length + 2
                                            }
                                            className="text-center py-6 text-gray-400"
                                        >
                                            Memuat data...
                                        </td>
                                    </tr>
                                )}

                                {!loading && rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={
                                                visibleColumns.length + 2
                                            }
                                            className="text-center py-6 text-gray-400"
                                        >
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    rows.map((user, idx) => (
                                        <tr
                                            key={user.id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-2">
                                                {startIndex + idx}
                                            </td>

                                            {visibleColumns.includes(
                                                "username"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.username}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "nama_depan"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.nama_depan}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "nama_belakang"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.nama_belakang}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "email"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.email}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "role"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.role}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "perusahaan"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.perusahaan || "-"}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "no_telepon"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        {user.no_telepon || "-"}
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "status"
                                            ) && (
                                                    <td className="px-3 py-2">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[
                                                                user.status
                                                            ] ||
                                                                "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            {STATUS_LABEL[
                                                                user.status
                                                            ] || user.status}
                                                        </span>
                                                    </td>
                                                )}
                                            {visibleColumns.includes(
                                                "created_at"
                                            ) && (
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </td>
                                                )}

                                            <td className="px-3 py-2">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tab === "active" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    setEditingUser(
                                                                        {
                                                                            ...user,
                                                                        }
                                                                    )
                                                                }
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleArchive(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Arsipkan
                                                            </button>
                                                        </>
                                                    )}

                                                    {tab === "archived" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleRestore(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Pulihkan
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleTrash(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Sampah
                                                            </button>
                                                        </>
                                                    )}

                                                    {tab === "trashed" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleRestore(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Pulihkan
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handlePermanentDelete(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs"
                                                            >
                                                                Hapus Permanen
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 text-sm">
                        <div className="text-gray-500">
                            {total === 0
                                ? "Menampilkan 0 data"
                                : `Menampilkan ${startIndex} sampai ${endIndex} dari ${total} data`}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`px-3 py-1.5 rounded border ${n === page
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Pengguna */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
                    <form
                        onSubmit={handleAddSubmit}
                        className="bg-white p-6 rounded-xl w-96"
                    >
                        <h2 className="text-xl font-bold mb-4">
                            Tambah Pengguna
                        </h2>

                        {addError && (
                            <p className="text-red-600 text-sm mb-3">
                                {addError}
                            </p>
                        )}
                        <input
                            required
                            placeholder="Username"
                            value={addForm.username}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    username: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            placeholder="Nama Depan"
                            value={addForm.nama_depan}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    nama_depan: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            placeholder="Nama Belakang"
                            value={addForm.nama_belakang}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    nama_belakang: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={addForm.email}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    email: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={addForm.password}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    password: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            placeholder="Perusahaan (opsional)"
                            value={addForm.perusahaan}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    perusahaan: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            placeholder="Nomor Telepon (opsional)"
                            value={addForm.no_telepon}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    no_telepon: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <select
                            required
                            value={addForm.role_id}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    role_id: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-4"
                        >
                            <option value="">Pilih Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setAddError("");
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Edit Pengguna */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
                    <form
                        onSubmit={handleEditSubmit}
                        className="bg-white p-6 rounded-xl w-96"
                    >
                        <h2 className="text-xl font-bold mb-4">
                            Edit Pengguna
                        </h2>

                        {editError && (
                            <p className="text-red-600 text-sm mb-3">
                                {editError}
                            </p>
                        )}

                        <input
                            required
                            placeholder="Username"
                            value={editingUser.username || ""}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    username: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            placeholder="Nama Depan"
                            value={editingUser.nama_depan || ""}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    nama_depan: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            placeholder="Nama Belakang"
                            value={editingUser.nama_belakang || ""}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    nama_belakang: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={editingUser.email}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    email: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            placeholder="Perusahaan (opsional)"
                            value={editingUser.perusahaan || ""}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    perusahaan: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            placeholder="Nomor Telepon (opsional)"
                            value={editingUser.no_telepon || ""}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    no_telepon: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <select
                            value={editingUser.role_id}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    role_id: Number(e.target.value),
                                })
                            }
                            className="w-full border p-2 rounded mb-4"
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingUser(null);
                                    setEditError("");
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default KelolaPengguna;