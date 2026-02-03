"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiLogOut,
} from "react-icons/fi";
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
      const { data: { session } } = await supabase.auth.getSession();
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
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={36} height={36} />
          <span className="font-semibold text-lg tracking-tight">
            Dare2Thai
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link className="hover:opacity-60 transition" href="/">
            {t("home")}
          </Link>
          <Link className="hover:opacity-60 transition" href="/post_pages">
            {t("place")}
          </Link>
          <Link className="hover:opacity-60 transition" href="/news">
            {t("news")}
          </Link>
          {user && isAdmin && (
            <Link className="hover:opacity-60 transition" href="/admin">
              {t("admin_panel")}
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className={`
              text-sm rounded px-2 py-1 border
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
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
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
                <FiLogOut />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm hover:opacity-60 transition"
            >
              {t("login")}
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`
              md:hidden px-6 py-4 space-y-3 border-t
              ${darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"}
            `}
          >
            <Link href="/" className="block">
              {t("home")}
            </Link>
            <Link href="/post_pages" className="block">
              {t("place")}
            </Link>
            <Link href="/news" className="block">
              {t("news")}
            </Link>

            {user && isAdmin && (
              <Link href="/admin" className="block">
                {t("admin_panel")}
              </Link>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className={`
                  text-sm rounded px-2 py-1 border
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
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm opacity-70 hover:opacity-100 transition"
              >
                {t("logout")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
