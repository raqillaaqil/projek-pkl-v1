import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="w-64 bg-black text-white min-h-screen p-6">
            <h2 className="font-bold text-xl mb-6">
                Admin Panel
            </h2>

            <div className="flex flex-col gap-4">
                <Link to="/admin">Dashboard</Link>
                <Link to="/users">Kelola User</Link>
                <Link to="/roles">Kelola Role</Link>
            </div>
        </div>
    );
}

export default Sidebar;