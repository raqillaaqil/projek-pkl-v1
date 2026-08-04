import Navbar from "../../components/Navbar";

function UserDashboard() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />

      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-3xl font-bold">
            Dashboard User
          </h1>

          <p className="mt-3 text-gray-500">
            Selamat Datang
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;