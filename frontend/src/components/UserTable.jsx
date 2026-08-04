import { useEffect, useState } from "react";

function UserTable() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] =
        useState(null);

    useEffect(() => {
        // API GET USERS DISINI
    }, []);

    const handleDelete = async (id) => {
        // API DELETE USER DISINI
    };

    const handleSave = async () => {
        // API UPDATE USER DISINI
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

                            <td>
                                <button
                                    onClick={() =>
                                        setEditingUser(user)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(user.id)
                                    }
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div>
                    Modal Edit User
                </div>
            )}
        </div>
    );
}

export default UserTable;