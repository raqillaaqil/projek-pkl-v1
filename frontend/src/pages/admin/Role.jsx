import Sidebar from "../../components/Sidebar";
import RoleTable from "../../components/RoleTable";

function RolePage() {
    return (
        <div className="flex min-h-screen bg-zinc-100">
            <Sidebar />

            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold">
                    Kelola Role
                </h1>

                <div className="mt-8">
                    <RoleTable />
                </div>
            </div>
        </div>
    );
}

export default RolePage;