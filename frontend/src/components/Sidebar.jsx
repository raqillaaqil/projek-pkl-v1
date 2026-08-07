import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (!confirm("Yakin ingin logout?")) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="w-64 bg-black text-white min-h-screen p-6 flex flex-col justify-between">
            <div>
                <h2 className="font-bold text-xl mb-6">
                    Admin Panel
                </h2>

                <div className="flex flex-col gap-4">
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/users">Kelola Pengguna</Link>
                    <Link to="/roles">Kelola Role</Link>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
            >
                Logout
            </button>
        </div>
    );
}

export default Sidebar;