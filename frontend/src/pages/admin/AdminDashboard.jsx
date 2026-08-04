import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import UserTable from "../../components/UserTable";

function AdminDashboard() {
  const [totalUsers, setTotalUsers] =
    useState(null);

  const [totalAdmins, setTotalAdmins] =
    useState(null);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold">
          Dashboard Admin
        </h1>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-white shadow rounded-xl p-6">
            <h2>Total User</h2>

            <p className="text-3xl font-bold mt-2">
              {totalUsers}
            </p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2>Total Admin</h2>

            <p className="text-3xl font-bold mt-2">
              {totalAdmins}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <UserTable />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;