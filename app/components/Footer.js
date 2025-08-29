"use client";


import { FaGithub } from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";
import React, { useContext } from "react";

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);

  const gradientText = darkMode
    ? "bg-gradient-to-r from-blue-500 via-purple-300 to-pink-400"
    : "bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300";

  return (
    <footer className={`font-sriracha mt-auto border-t transition duration-500 border-blue-400 dark:border-pink-400 ${darkMode ? "dark:bg-gray-900" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto py-2 flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        {/* Left: Brand & Info */}
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left flex-1">
          <h2
            className={`text-sm w-full font-extrabold tracking-tight bg-clip-text text-transparent select-none bg-[length:200%_auto] animate-gradient-anim ${gradientText}`}
          >
            Dare2Thai
          </h2>
          <p
            className={`text-xs font-light tracking-tight bg-clip-text text-transparent select-none bg-[length:200%_auto] animate-gradient-anim ${gradientText}`}
          >
            © 2025 All rights reserved.
          </p>
          <p
            className={`text-xs font-light tracking-tight bg-clip-text text-transparent select-none bg-[length:200%_auto] animate-gradient-anim ${gradientText}`}
          >
            Contact us:{" "}
            <a
              href="tel:0649857665"
              className={`underline transition ${darkMode ? "hover:text-blue-400" : "hover:text-pink-400"}`}
            >
              088-888-8888
            </a>
          </p>
        </div>
        {/* Right: Contributors */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-1">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/tanawatmix"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${darkMode ? "text-blue-400 hover:text-pink-400" : "text-pink-400 hover:text-blue-400"}`}
              title="tanawatmix GitHub"
            >
              <FaGithub className="text-2xl" />
            </a>
            <span className="text-xs font-mono">6552410002</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/MOOMOO888"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${darkMode ? "text-blue-400 hover:text-pink-400" : "text-pink-400 hover:text-blue-400"}`}
              title="MOOMOO888 GitHub"
            >
              <FaGithub className="text-2xl" />
            </a>
            <span className="text-xs font-mono">6552410003</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
