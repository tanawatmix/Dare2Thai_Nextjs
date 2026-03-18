"use client";

import React, { useState, useEffect, useContext } from "react";
import { FiMenu, FiX, FiMoon, FiSun, FiLogOut } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import logo from "../../public/dare2New.png";
import { ThemeContext } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const router = useRouter();

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

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) await fetchProfile(currentUser.id);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchProfile(currentUser.id);
        else setProfile(null);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // ปิดเมนูมือถือหลังกด Logout
    router.push("/");
    router.refresh();
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  const isAdmin = profile?.role === "admin";

  return (
    <nav
      className={`
        fixed top-0 w-full z-50
        border-b
        ${darkMode ? "bg-gray-950 border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"}
        transition-colors
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src={logo} alt="logo" width={36} height={36} />
          <span className="hidden sm:inline font-semibold text-lg tracking-tight">
            Dare2Thai
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium flex-1 justify-center px-4">
          <Link
            className="hover:opacity-60 transition whitespace-nowrap"
            href="/"
          >
            {t("home")}
          </Link>
          <Link
            className="hover:opacity-60 transition whitespace-nowrap"
            href="/post_pages"
          >
            {t("place")}
          </Link>
          <Link
            className="hover:opacity-60 transition whitespace-nowrap"
            href="/news"
          >
            {t("news")}
          </Link>
          {user && isAdmin && (
            <Link
              className="hover:opacity-60 transition whitespace-nowrap"
              href="/admin"
            >
              {t("admin_panel")}
            </Link>
          )}
        </div>

        {/* Right Desktop */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className={`
              text-xs lg:text-sm rounded px-2 py-1 border
              ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}
            `}
          >
            <option value="th">TH</option>
            <option value="en">EN</option>
          </select>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <Link href="/profile">
                <Image
                  src={profile?.profile_image || "/default-avatar.png"}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title={t("logout")}
              >
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs lg:text-sm hover:opacity-60 transition whitespace-nowrap font-medium text-blue-600 dark:text-blue-400"
            >
              {t("login")}
            </Link>
          )}
        </div>

        {/* Mobile Right Section */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Mobile Toggle Button */}
          <button className="p-2" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`
              md:hidden px-4 sm:px-6 py-4 space-y-3 border-t shadow-lg
              ${darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"}
            `}
          >
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-sm py-2"
            >
              {t("home")}
            </Link>
            <Link
              href="/post_pages"
              onClick={() => setIsOpen(false)}
              className="block text-sm py-2"
            >
              {t("place")}
            </Link>
            <Link
              href="/news"
              onClick={() => setIsOpen(false)}
              className="block text-sm py-2"
            >
              {t("news")}
            </Link>

            {user && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-sm py-2"
              >
                {t("admin_panel")}
              </Link>
            )}

            {/* Mobile Auth & Settings Section */}
            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className={`
                    text-xs rounded px-2 py-1 border
                    ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}
                  `}
                >
                  <option value="th">TH</option>
                  <option value="en">EN</option>
                </select>
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Image
                        src={profile?.profile_image || "/default-avatar.png"}
                        alt="avatar"
                        width={18}
                        height={18}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                      <span className="text-sm font-medium">
                        {t("profile") || "Profile"}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition py-2"
                    >
                      <FiLogOut size={16} />
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center w-full bg-blue-600 text-white rounded-md py-2 mx-5 text-sm font-medium hover:bg-blue-700 transition"
                  >
                    {t("login")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
