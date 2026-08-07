import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

function Profile() {
    const [selectedImage, setSelectedImage] =
        useState(null);

    const [loading, setLoading] = useState(false);

    const [preview, setPreview] =
        useState("");

    const [user, setUser] =
        useState(null);

    const currentUser = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {


        fetch(
            `http://localhost:5000/api/users/${currentUser.id}`
        )
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch((err) => console.log(err));
    }, []);

    const handleUpload = async () => {
        if (!selectedImage) {
            return alert("Pilih foto terlebih dahulu");
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("photo", selectedImage);

            await fetch(
                `http://localhost:5000/api/users/upload/${currentUser.id}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const res = await fetch(
                `http://localhost:5000/api/users/${currentUser.id}`
            );

            const data = await res.json();

            setUser(data);
            setSelectedImage(null);
            setPreview("");

            alert("Foto berhasil diperbarui");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-zinc-100">
            <Navbar />

            <div className="max-w-xl mx-auto mt-10">
                <div className="bg-white p-8 rounded-xl shadow">
                    {preview ? (
                        <img
                            src={preview}
                            alt="preview"
                            className="w-32 h-32 rounded-full object-cover mx-auto"
                        />
                    ) : user?.photo ? (
                        <img
                            src={`http://localhost:5000/uploads/${user.photo}`}
                            alt="profile"
                            className="w-32 h-32 rounded-full object-cover mx-auto"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-zinc-200 mx-auto" />
                    )}

                  <h2 className="text-2xl font-bold text-center mt-4">
                        {user?.nama_depan} {user?.nama_belakang}
                    </h2>

                    <p className="text-center text-gray-500">
                        @{user?.username}
                    </p>

                    <p className="text-center text-gray-500">
                        {user?.email}
                    </p>

                    <p className="text-center text-gray-500">
                        Role: {user?.role}
                    </p>

                    {user?.perusahaan && (
                        <p className="text-center text-gray-500">
                            {user.perusahaan}
                        </p>
                    )}

                    {user?.no_telepon && (
                        <p className="text-center text-gray-500 mb-6">
                            {user.no_telepon}
                        </p>
                    )}

                    <p className="text-center mb-5">
                        {user?.photo
                            ? "Foto profil sudah tersedia."
                            : "Kamu belum memiliki foto profil."}
                    </p>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setSelectedImage(file);

                            if (file) {
                                setPreview(URL.createObjectURL(file));
                            }
                        }}
                        className="mb-4 w-full"
                    />

                    <button
                        onClick={handleUpload}
                        className="w-full py-3 rounded-lg bg-black text-white"
                    >
                        {user?.photo
                            ? "Ganti Foto Profil"
                            : "Tambahkan Foto Profil"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;