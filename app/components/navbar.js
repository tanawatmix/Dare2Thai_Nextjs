"use client";

import React, { useState, useEffect, useContext } from "react";
import { FiMenu, FiX, FiUser, FiMoon, FiSun } from "react-icons/fi";
import Image from "next/image";
import logo from "../../public/dare2New.png";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // ✅ IMPORT จาก config โดยตรง
import { ThemeContext } from "./../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { t } = useTranslation(); // ✅ ใช้แค่ t()
  const [language, setLanguage] = useState(i18n.language);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      const storedUser = localStorage.getItem("user");
      setIsLoggedIn(status);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // ✅ เมื่อเปลี่ยนภาษา
  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      setLanguage(storedLang);
      i18n.changeLanguage(storedLang);
    } else {
      setLanguage(i18n.language);
    }
  }, []);

  const TOGGLE_CLASSES =
    "text-sm font-medium font-sriracha flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-3 md:py-1.5 transition-colors relative z-10";

  const NavButton = ({ to, children, className = "", ...props }) => (
    <button
      onClick={() => (window.location.href = to)}
      className={`font-sriracha transition duration-300 font-bold px-2 py-1 rounded hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-200  ${
        darkMode
          ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent"
          : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  const [selected, setSelected] = useState("light");

  useEffect(() => {
    setSelected(darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  // เช็คว่า user นี้เป็น admin ไหม (id === 999)
  const isAdmin = user?.id === 999;

  return (
    <nav
      className={`font-sriracha border-b py-4 px-6 fixed w-full z-50 shadow transition duration-500
        ${darkMode ? "border-white bg-gray-900" : "border-blue-400 bg-white"}
      `}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <Image src={logo} alt="logo" className="h-10 w-20 object-contain" />
          <span
            className={`ml-2 text-xl font-extrabold tracking-tight select-none animate-gradient-anim
              ${
                darkMode
                  ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 bg-clip-text text-transparent"
              }`}
          >
            Dare2Thai
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <NavButton to="/post_pages" className="text-base">
            {t("place")}
          </NavButton>
          <NavButton to="/" className="text-base">
            {t("home")}
          </NavButton>

          {/* ปุ่ม Admin Panel เฉพาะ admin */}
          {isLoggedIn && isAdmin && (
            <NavButton to="/admin" className="text-base">
              {t("admin_panel") || "Admin Panel"}
            </NavButton>
          )}

          {isLoggedIn ? (
            <>
              <NavButton
                to="/profile"
                className="flex items-center gap-2 text-base"
              >
                {/* รูปโปรไฟล์ */}
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="avatar"
                    width={43}
                    height={43}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  // ถ้าไม่มีรูป ให้แสดงไอคอนแทน
                  <FiUser className="text-lg" />
                )}

                {/* ชื่อผู้ใช้ */}
                {t("hello_user", { name: user?.username })}
              </NavButton>
              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-1 rounded font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <NavButton to="/register" className="text-base">
                {t("register")}
              </NavButton>
              <NavButton to="/login" className="text-base">
                {t("login")}
              </NavButton>
            </>
          )}

          {/* Language selector */}
          <select
            onChange={(e) => {
              const newLang = e.target.value;
              i18n.changeLanguage(newLang);
              localStorage.setItem("language", newLang);
              setLanguage(newLang);
            }}
            value={language}
            className={`border rounded px-2 py-1 text-sm transition duration-300 ${
              darkMode ? "text-white border-white bg-pink-500" : "text-black"
            }`}
          >
            <option value="th">ภาษาไทย</option>
            <option value="en">ENGLISH</option>
          </select>

          {/* Theme toggle */}
          <div className="relative flex w-fit items-center rounded-full border border-gray-300 dark:border-gray-600">
            <button
              className={`${TOGGLE_CLASSES} ${
                selected === "light"
                  ? darkMode
                    ? "text-slate-300"
                    : "text-slate-800"
                  : "text-white"
              } px-2 py-1`}
              onClick={() => {
                setSelected("light");
                if (darkMode) toggleDarkMode();
              }}
            >
              <FiSun className="mr-1" />
              <span className="hidden md:inline">Light</span>
            </button>
            <button
              className={`${TOGGLE_CLASSES} ${
                selected === "dark"
                  ? "text-white"
                  : darkMode
                  ? "text-slate-300"
                  : "text-slate-800"
              } px-2 py-1`}
              onClick={() => {
                setSelected("dark");
                if (!darkMode) toggleDarkMode();
              }}
            >
              <FiMoon className="mr-1" />
              <span className="hidden md:inline">Dark</span>
            </button>
            <div
              className={`absolute inset-0 z-0 flex ${
                selected === "dark" ? "justify-end" : "justify-start"
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", damping: 15, stiffness: 250 }}
                className={`h-full w-1/2 rounded-full ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-500 to-purple-600"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <div
        className={`md:hidden absolute top-4 right-6 ${
          darkMode ? "text-white" : "text-secondary"
        }`}
      >
        <button onClick={toggleMenu}>
          {isOpen ? <FiX size={30} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <div
            className={`md:hidden mt-4 flex flex-col space-y-2 rounded p-4 ${
              darkMode ? "bg-gray-800" : "bg-primary"
            }`}
          >
            <NavButton to="/post_pages">{t("place")}</NavButton>
            <NavButton to="/home">{t("home")}</NavButton>

            {/* ปุ่ม Admin Panel mobile */}
            {isLoggedIn && isAdmin && (
              <NavButton to="/admin">
                {t("admin_panel") || "Admin Panel"}
              </NavButton>
            )}

            {!isLoggedIn ? (
              <>
                <NavButton to="/register">{t("register")}</NavButton>
                <NavButton to="/login">{t("login")}</NavButton>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="font-bold text-red-500 hover:text-red-700 transition"
                >
                  {t("logout")}
                </button>
                <NavButton
                  to="/profile"
                  className="flex items-center justify-center gap-2 text-base"
                >
                  {/* รูปโปรไฟล์ */}
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="avatar"
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    // ถ้าไม่มีรูป ให้แสดงไอคอนแทน
                    <FiUser className="text-lg" />
                  )}

                  {/* ชื่อผู้ใช้ */}
                  {t("hello_user", { name: user?.username })}
                </NavButton>
              </>
            )}

            {/* ภาษาใน mobile */}
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={language}
              className={`border rounded px-2 py-1 ${
                darkMode ? "text-white border-white bg-gray-800" : "text-black"
              }`}
            >
              <option value="th">ภาษาไทย</option>
              <option value="en">ENGLISH</option>
            </select>
            <div className="relative flex w-fit items-center rounded-full border border-gray-300 dark:border-gray-600">
              <button
                className={`${TOGGLE_CLASSES} ${
                  selected === "light"
                    ? darkMode
                      ? "text-slate-300"
                      : "text-slate-800"
                    : "text-white"
                } px-2 py-1`}
                onClick={() => {
                  setSelected("light");
                  if (darkMode) toggleDarkMode();
                }}
              >
                <FiSun className="mr-1" />
                <span className="hidden md:inline">Light</span>
              </button>
              <button
                className={`${TOGGLE_CLASSES} ${
                  selected === "dark"
                    ? "text-white"
                    : darkMode
                    ? "text-slate-300"
                    : "text-slate-800"
                } px-2 py-1`}
                onClick={() => {
                  setSelected("dark");
                  if (!darkMode) toggleDarkMode();
                }}
              >
                <FiMoon className="mr-1" />
                <span className="hidden md:inline">Dark</span>
              </button>
              <div
                className={`absolute inset-0 z-0 flex ${
                  selected === "dark" ? "justify-end" : "justify-start"
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", damping: 15, stiffness: 250 }}
                  className={`h-full w-1/2 rounded-full ${
                    darkMode
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600"
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
