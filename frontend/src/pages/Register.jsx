import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      alert(data.message);

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Register gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6">
          Register
        </h1>

        <input
          name="name"
          placeholder="Nama"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Register
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register;