"use client";

import React, { useState, useEffect, useContext } from "react";
import { FiMenu, FiX, FiUser, FiMoon, FiSun, FiLogOut } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import logo from "../../public/dare2New.png";
import { ThemeContext } from "./../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const { t } = useTranslation(); // ✅ ใช้ i18next แปลภาษา

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchProfile(currentUser.id);
        else setProfile(null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  const isAdmin = profile?.role === "admin";

  return (
    <nav
      className={`fixed w-full z-50 px-6 py-3 shadow-md transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-2xl font-extrabold select-none bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-blue-500 animate-gradient-anim">
            Dare2Thai
          </span>
        </Link>
        {/* Center: Menu */}
        <div className="hidden md:flex gap-8 font-semibold text-base absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className="hover:text-blue-500 transition-colors duration-200"
          >
            {t("home")}
          </Link>
          <Link
            href="/post_pages"
            className="hover:text-blue-500 transition-colors duration-200"
          >
            {t("place")}
          </Link>
          <Link
            href="/news"
            className="hover:text-blue-500 transition-colors duration-200"
          >
            {t("news")}
          </Link>
          {user && isAdmin && (
            <Link
              href="/admin"
              className="hover:text-red-500 transition-colors duration-200"
            >
              {t("admin_panel")}
            </Link>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2">
                  <Image
                    src={profile?.profile_image || "/dare2New.png"}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <span className="font-medium">
                    {profile?.name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title={t("logout")}
                  className="p-2 rounded-full bg-red-100 dark:bg-red-700 text-red-500 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600 transition"
                >
                  <FiLogOut />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t("register")}
                </Link>
              </>
            )}

            {/* Language */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className={`border px-2 py-1 rounded text-sm ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-200 border-gray-300"
              }`}
            >
              <option value="th">TH</option>
              <option value="en">EN</option>
            </select>

            {/* Theme */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2" onClick={toggleMenu}>
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`md:hidden mt-3 rounded-lg shadow-lg p-4 flex flex-col gap-3 ${
              darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            <Link
              href="/"
              className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {t("home")}
            </Link>
            <Link
              href="/post_pages"
              className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {t("place")}
            </Link>
            <Link
              href="/news"
              className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              
            {t("news")}
            </Link>
            
            {user && isAdmin && (
              <Link
                href="/admin"
                className="px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-700 transition"
              >
                {t("admin_panel")}
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <Image
                    src={profile?.profile_image || "/default-avatar.png"}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <span>{profile?.name || user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-500 hover:text-red-700 px-2 py-1 rounded transition"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {t("register")}
                </Link>
              </>
            )}

            {/* Language + Theme */}
            <div className="flex items-center justify-between mt-2">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className={`border px-2 py-1 rounded text-sm w-24 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-200 border-gray-300"
                }`}
              >
                <option value="th">TH</option>
                <option value="en">EN</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => !darkMode && toggleDarkMode()}
                  className={`p-2 rounded-full ${
                    !darkMode ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  <FiSun />
                </button>
                <button
                  onClick={() => darkMode && toggleDarkMode()}
                  className={`p-2 rounded-full ${
                    darkMode ? "bg-purple-500 text-white" : ""
                  }`}
                >
                  <FiMoon />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;