"use client";
import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../ThemeContext";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { BsCardImage } from "react-icons/bs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import mockPosts from "../mock/mockPost";

const placeTypes = ["ร้านอาหาร", "สถานที่ท่องเที่ยว", "โรงแรม"];
const provinces = [
    "กรุงเทพมหานคร",
    "กระบี่",
    "กาญจนบุรี",
    "เชียงใหม่",
    "อุบลราชธานี",
];

const EditPost = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get("id");

    const [posts, setPosts] = useState(mockPosts);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [placeType, setPlaceType] = useState("");
    const [province, setProvince] = useState("");
    const { darkMode } = useContext(ThemeContext) || { darkMode: false };

    useEffect(() => {
        if (!postId) return;
        const foundPost = posts.find((post) => post.id.toString() === postId);
        if (foundPost) {
            setTitle(foundPost.title || "");
            setDesc(foundPost.desc || "");
            setPlaceType(foundPost.placeType || "");
            setProvince(foundPost.province || "");
            setImagePreviews(foundPost.images || []);
            setImages([]);
        } else {
            alert("ไม่พบโพสต์ที่ต้องการแก้ไข");
            router.push("/post_pages");
        }
    }, [postId, posts, router]);

    const handleImageChange = (e) => {
        const files = e.target.files;
        if (!files) return;
        const selectedFiles = Array.from(files).slice(0, 5);
        setImages(selectedFiles);
        const previews = selectedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleRemoveImage = (idx) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
        setImages((prev) => prev.filter((_, i) => i !== idx));
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
        const updatedPosts = posts.map((post) =>
            post.id.toString() === postId
                ? {
                        ...post,
                        title,
                        desc,
                        placeType,
                        province,
                        images: imagePreviews,
                    }
                : post
        );
        setPosts(updatedPosts);
        alert("แก้ไขโพสต์เรียบร้อย! (ใน mock data runtime)");
        router.push("/post_pages");
    };

    return (
        <div
            className="font-sriracha relative bg-fixed bg-center bg-cover transition duration-500 flex-1 min-h-screen"
            style={{
                backgroundImage: `url(${darkMode ? "/bp.jpg" : "/whiteWater.jpg"})`,
            }}
        >
            <Navbar />
            <div className="py-24 min-h-[80vh] flex items-center justify-center">
                <div className="w-full max-w-xl mx-auto p-8 bg-white/90 dark:bg-secondary/90 rounded-2xl shadow-2xl border border-blue-300 dark:border-pink-400">
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-secondary dark:text-primary tracking-tight">
                        {t("editPost") || "แก้ไขโพสต์"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t("postTitle") || "ชื่อร้าน / โพสต์"}
                            </label>
                            <input
                                type="text"
                                placeholder="ชื่อร้าน / โพสต์"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-400 text-secondary rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t("desc") || "รายละเอียด"}
                            </label>
                            <textarea
                                placeholder="รายละเอียด"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-400 text-secondary rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white"
                                rows={4}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {t("selectType") || "เลือกประเภท"}
                                </label>
                                <select
                                    value={placeType}
                                    onChange={(e) => setPlaceType(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                                >
                                    <option value="">{t("selectType") || "เลือกประเภท"}</option>
                                    {placeTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {t("selectProvince") || "เลือกจังหวัด"}
                                </label>
                                <select
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200"
                                >
                                    <option value="">{t("selectProvince") || "เลือกจังหวัด"}</option>
                                    {provinces.map((prov) => (
                                        <option key={prov} value={prov}>
                                            {prov}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t("addPho") || "เพิ่มรูปภาพ"}
                            </label>
                            <button
                                type="button"
                                onClick={() => document.getElementById("image-upload")?.click()}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-xs px-4 py-3 dark:bg-secondary dark:text-primary border border-blue-400 dark:border-pink-400 text-secondary rounded-full hover:bg-blue-200 dark:hover:bg-gray-700 transition"
                            >
                                <BsCardImage className="text-2xl" />
                                {t("addPho") || "เพิ่มรูปภาพ"}
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
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={src}
                                                alt={`preview-${idx}`}
                                                className="w-20 h-20 object-cover rounded-lg border shadow"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition"
                                                title="ลบรูป"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                            >
                                {t("save") || "บันทึก"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                            >
                                {t("canc") || "ยกเลิก"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EditPost;
