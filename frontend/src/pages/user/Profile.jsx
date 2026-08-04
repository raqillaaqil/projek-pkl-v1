import { useState } from "react";
import Navbar from "../../components/Navbar";

function Profile() {
    const [selectedImage, setSelectedImage] =
        useState(null);

    const [preview, setPreview] =
        useState(null);

    const handleUpload = async () => {
        // TEMPAT API UPLOAD FOTO
    };

    return (
        <div>
            <Navbar />

            {preview && (
                <img
                    src={preview}
                    alt="profile"
                />
            )}

            <input
                type="file"
                onChange={(e) => {
                    const file =
                        e.target.files[0];

                    setSelectedImage(file);

                    setPreview(
                        URL.createObjectURL(file)
                    );
                }}
            />

            <button onClick={handleUpload}>
                kirim
            </button>
        </div>
    );
}

export default Profile;