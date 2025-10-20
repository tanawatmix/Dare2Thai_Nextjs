"use client";

import React, { useState, useEffect, useContext } from "react";
import { FiMenu, FiX, FiUser, FiMoon, FiSun } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import logo from "../../public/dare2New.png";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { ThemeContext } from "./../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // No TypeScript type needed
  const [profile, setProfile] = useState(null); // No TypeScript type needed
  const [language, setLanguage] = useState(i18n.language);
  const [selected, setSelected] = useState(darkMode ? "dark" : "light");

  // --- Main Authentication Effect ---
  useEffect(() => {
    // Function to fetch profile data
    const fetchProfile = async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*') // Select all profile fields or specify needed ones like 'name, profile_image, role'
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
      else if (error) console.error("Error fetching profile:", error.message); // Log error message
    };

    // 1. Check current session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            fetchProfile(currentUser.id);
        }
    });

    // 2. Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null); // Clear profile on logout
      }
    });

    // 3. Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // (Other useEffects for language and theme can remain the same)
  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang && storedLang !== i18n.language) {
      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    setSelected(darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // User and profile state will be cleared by the listener
    router.push('/');
    router.refresh();
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  // Use optional chaining (?.) for safety when accessing profile properties
  const isAdmin = profile?.role === 'admin';

  return (
    <nav className={`font-sriracha border-b py-2 px-5 fixed w-full z-50 shadow transition duration-500 ${darkMode ? "border-white bg-gray-900" : "border-blue-400 bg-white"}`}>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center cursor-pointer">
          <Image src={logo} alt="logo" className="h-10 w-10 object-contain" />
          <span className={`ml-2 text-sm font-extrabold tracking-tight select-none animate-gradient-anim ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>
            Dare2Thai
          </span>
        </Link>

        {/* --- Desktop Menu --- */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/post_pages" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200 text-base ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>{t("place")}</Link>
          <Link href="/" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200 text-base ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>{t("home")}</Link>
          
          {user && isAdmin && (
            <Link href="/admin" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200 text-base ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>{t("admin_panel") || "Admin Panel"}</Link>
          )}

          {user ? (
            // Use standard React Fragments <> </> instead of <> </> which is TypeScript syntax
            <>
              <Link href="/profile" className="flex items-center gap-2">
                {/* Use optional chaining (?.) for safety */}
                {profile?.profile_image ? (
                  <Image src={profile.profile_image} alt="avatar" width={43} height={43} className="rounded-full object-cover" unoptimized />
                ) : (
                  <FiUser className={`text-lg ${darkMode ? "text-white" : "text-black"}`} />
                )}
                {/* Use optional chaining (?.) for safety */}
                <span className={darkMode ? "text-white" : "text-black"}>{t("hello_user", { name: profile?.name || user.email })}</span>
              </Link>
              <button onClick={handleLogout} className="ml-1 px-3 py-1 rounded font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200 text-base ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>{t("register")}</Link>
              <Link href="/login" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200 text-base ${darkMode ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"}`}>{t("login")}</Link>
            </>
          )}

          <select onChange={(e) => changeLanguage(e.target.value)} value={language} className={`border rounded px-2 py-1 text-sm transition duration-300 ${darkMode ? "text-white border-white bg-pink-500" : "text-black"}`}>
            <option value="th">ภาษาไทย</option>
            <option value="en">ENGLISH</option>
          </select>

          {/* Theme Toggle Buttons - Fixed ClassNames */}
          <div className="relative flex w-fit items-center rounded-full border border-gray-300 dark:border-gray-600 p-1">
            <button
                className={`text-sm font-medium flex items-center gap-1 px-2.5 py-1 transition relative z-10 ${selected === 'light' ? (darkMode ? 'text-white' : 'text-slate-800') : (darkMode ? 'text-slate-300' : 'text-slate-500')}`} // Fixed class logic
                onClick={() => { setSelected("light"); if (darkMode) toggleDarkMode(); }}>
                <FiSun /> <span className="hidden md:inline">Light</span>
            </button>
            <button
                className={`text-sm font-medium flex items-center gap-1 px-2.5 py-1 transition relative z-10 ${selected === 'dark' ? 'text-white' : (darkMode ? 'text-slate-300' : 'text-slate-500')}`} // Fixed class logic
                onClick={() => { setSelected("dark"); if (!darkMode) toggleDarkMode(); }}>
                <FiMoon /> <span className="hidden md:inline">Dark</span>
            </button>
            <div className={`absolute inset-0 z-0 flex ${selected === "dark" ? "justify-end" : "justify-start"}`}>
                <motion.span layout transition={{ type: "spring", damping: 15, stiffness: 250 }} className={`h-full w-1/2 rounded-full ${darkMode ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gradient-to-r from-violet-600 to-indigo-600"}`} />
            </div>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className={`md:hidden ${darkMode ? "text-white" : "text-secondary"}`}>
          <button onClick={toggleMenu}>
            {isOpen ? <FiX size={30} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`md:hidden mt-4 flex flex-col items-center space-y-4 rounded p-4 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            <Link href="/post_pages" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded ...`}>{t("place")}</Link>
            <Link href="/" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded ...`}>{t("home")}</Link>
            
            {user && isAdmin && (
              <Link href="/admin" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded ...`}>{t("admin_panel") || "Admin Panel"}</Link>
            )}

            {user ? (
              <>
                <Link href="/profile" className="flex items-center justify-center gap-2">
                  {profile?.profile_image ? <Image src={profile.profile_image} alt="avatar" width={36} height={36} className="rounded-full object-cover" unoptimized /> : <FiUser className={`text-lg ${darkMode ? "text-white" : "text-black"}`} />}
                  <span className={darkMode ? "text-white" : "text-black"}>{t("hello_user", { name: profile?.name || user.email })}</span>
                </Link>
                <button onClick={handleLogout} className="font-bold text-red-500 hover:text-red-700 transition">{t("logout")}</button>
              </>
            ) : (
              <>
                <Link href="/register" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded ...`}>{t("register")}</Link>
                <Link href="/login" className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded ...`}>{t("login")}</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;