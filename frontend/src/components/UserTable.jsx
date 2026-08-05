import { useEffect, useState } from "react";

function UserTable() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [editingUser, setEditingUser] =
        useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.log(err));

        fetch("http://localhost:5000/api/roles")
            .then((res) => res.json())
            .then((data) => {
                console.table(data);
                setRoles(data);
            })
            .catch((err) => console.log(err));
    }, []);
    const handleDelete = async (id) => {
        try {
            await fetch(
                `http://localhost:5000/api/users/${id}`,
                {
                    method: "DELETE",
                }
            );

            fetch("http://localhost:5000/api/roles")
                .then((res) => res.json())
                .then((data) => setRoles(data))
                .catch((err) => console.log(err));

            setUsers(
                users.filter(
                    (user) => user.id !== id
                )
            );
        } catch (error) {
            console.log(error);
        }
    };

    const handleSave = async () => {
        console.log("Data yang dikirim:", editingUser);
        try {
            await fetch(
                `http://localhost:5000/api/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        editingUser
                    ),
                }
            );

            setUsers(
                users.map((user) =>
                    user.id === editingUser.id
                        ? editingUser
                        : user
                )
            );

            setEditingUser(null);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
                Data User
            </h2>

            <table className="w-full">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>

                            <td className="space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingUser(user);
                                        console.log(user);
                                    }}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="text-xl font-bold mb-4">
                            Edit User
                        </h2>

                        <input
                            value={editingUser.name}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    name: e.target.value,
                                })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            value={editingUser.email}
                            onChange={(e) =>
                                setEditingUser({
                                    ...editingUser,
                                    email: e.target.value,
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
                                <option
                                    key={role.id}
                                    value={role.id}
                                >
                                    {role.role_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Simpan
                            </button>

                            <button
                                onClick={() => setEditingUser(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserTable;