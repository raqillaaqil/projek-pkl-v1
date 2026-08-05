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

       
        <div className="mt-8">
          <UserTable />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;