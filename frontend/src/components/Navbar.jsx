import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("user")
    );

    fetch(
      `http://localhost:5000/api/users/${currentUser.id}`
    )
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">
        PKL APP
      </h1>

      <div className="flex items-center gap-4">
        <Link to="/user">
          Dashboard
        </Link>

        <Link to="/profile">
          Profile
        </Link>

        {user?.photo && (
          <img
            src={`http://localhost:5000/uploads/${user.photo}`}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;