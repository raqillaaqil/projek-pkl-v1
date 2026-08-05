import { useEffect, useState } from "react";

function RoleTable() {
    const [roles, setRoles] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [editingRole, setEditingRole] = useState(null);

    const fetchRoles = () => {
        fetch("http://localhost:5000/api/roles")
            .then((res) => res.json())
            .then((data) => setRoles(data))
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSave = async () => {
        if (!roleName) return alert("Role tidak boleh kosong");

        const url = editingRole
            ? `http://localhost:5000/api/roles/${editingRole.id}`
            : "http://localhost:5000/api/roles";

        const method = editingRole ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                role_name: roleName,
            }),
        });

        setRoleName("");
        setEditingRole(null);
        fetchRoles();
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/roles/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                return alert(data.message);
            }

            alert(data.message);
            fetchRoles();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow mt-8">
            <h2 className="text-xl font-bold mb-4">
                Data Role
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    value={roleName}
                    onChange={(e) =>
                        setRoleName(e.target.value)
                    }
                    placeholder="Nama Role"
                    className="border p-2 rounded flex-1"
                />

                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 rounded"
                >
                    {editingRole ? "Update" : "Tambah"}
                </button>
            </div>

            <table className="w-full">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id}>
                            <td>{role.id}</td>
                            <td>{role.role_name}</td>

                            <td className="space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingRole(role);
                                        setRoleName(role.role_name);
                                    }}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(role.id)
                                    }
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RoleTable;