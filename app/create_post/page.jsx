"use client";
import { useState, useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { BsCardImage } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "เชียงใหม่", "อุบลราชธานี"];

const CreatePost = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [placeType, setPlaceType] = useState("");
    const [province, setProvince] = useState("");
    const router = useRouter();

    const handleImageChange = (e) => {
        const files = e.target.files;
        if (!files) return;
        const selectedFiles = Array.from(files).slice(0, 5);
        setImages(selectedFiles);
        const previews = selectedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (placeType === "") {
            alert("กรุณาเลือกประเภทสถานที่");
            return;
        }
        if (province === "") {
            alert("กรุณาเลือกจังหวัด");
            return;
        }
        alert("โพสต์เรียบร้อย!");
        router.push("/post_pages");
    };

    // If you don't have ThemeContext, just set darkMode = false;
    const { darkMode } = useContext(ThemeContext) || { darkMode: false };

    return (
        <div
            className="font-sriracha relative bg-fixed bg-center bg-cover transition duration-500 flex-1"
            style={{
                backgroundImage: `url(${darkMode ? "/bp.jpg" : "/whiteWater.jpg"})`,
            }}
        >
            <Navbar />
            <div className="py-28 from-white to-gray-100">
                <div className="max-w-md mx-auto p-5  bg-white rounded-lg shadow-md border border-blue-400 dark:border-pink-400">
                    <h2 className="text-xl font-semibold mb-4 text-center text-black ">
                        {t("newPost")}
                    </h2>
                    <form onSubmit={handleSubmit} className="text-black space-y-4">
                        <input
                            type="text"
                            placeholder="ชื่อร้าน / โพสต์"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border text-black focus:outline-none text-secondary rounded px-4 py-2"
                            required
                        />
                        <textarea
                            placeholder="รายละเอียด"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full text-black border text-secondary rounded px-4 py-2"
                            rows={4}
                            required
                        />

                        <div>
                            <select
                                value={placeType}
                                onChange={(e) => setPlaceType(e.target.value)}
                                className="w-1/3 p-2 border ml-12 text-blue-600 bg-blue-100 rounded-full mr-10"
                            >
                                <option value="">เลือกประเภท</option>
                                {placeTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-1/3 p-2 border text-green-600 bg-green-100 rounded-full"
                            >
                                <option value="">เลือกจังหวัด</option>
                                {provinces.map((prov) => (
                                    <option key={prov} value={prov}>
                                        {prov}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                document.getElementById("image-upload")?.click()
                            }
                            className="w-full bg-primary text-xs px-10 w-14 justify-items-center dark:bg-secondary dark:text-primary border border-blue-400 dark:border-pink-400 text-secondary py-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                        >
                            <BsCardImage className="text-2xl" />
                            {t("addPho")}
                        </button>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {imagePreviews.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`preview-${idx}`}
                                        className="w-20 h-20 object-cover rounded border"
                                    />
                                ))}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-1/3 bg-blue-500 text-white py-2 mr-1 ml-6 rounded hover:bg-pink-400 transition"
                            >
                                {t("post")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTitle("");
                                    setDesc("");
                                    setImages([]);
                                    setImagePreviews([]);
                                    setSelectedTags([]);
                                    setPlaceType("");
                                    setProvince("");
                                }}
                                className="w-1/3 mt-2 bg-red-500 text-white py-2 ml-20 rounded hover:bg-pink-400 transition"
                            >
                                {t("canc")}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    router.back();
                                }}
                                className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-pink-400 transition"
                            >
                                {t("back")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreatePost;
