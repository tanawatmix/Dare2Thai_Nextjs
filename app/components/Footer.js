"use client";

import { FaGithub } from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";
import React, { useContext } from "react";

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <footer
      className={`mt-auto border-t ${
        darkMode
          ? "bg-gray-950 border-gray-800 text-gray-400"
          : "bg-white border-gray-200 text-gray-600"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <h2
            className={`text-base font-semibold tracking-tight ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Dare2Thai
          </h2>
          <p className="text-sm">© 2026 All rights reserved.</p>
          <p className="text-sm">
            Contact:{" "}
            <a
              href="tel:0649857665"
              className={`underline underline-offset-4 transition ${
                darkMode ? "hover:text-blue-300" : "hover:text-blue-600"
              }`}
            >
              088-888-8888
            </a>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/tanawatmix"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
              }`}
              title="tanawatmix GitHub"
            >
              <FaGithub className="text-xl" />
            </a>
            <span className="text-xs font-mono tracking-wide">6552410002</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/MOOMOO888"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
              }`}
              title="MOOMOO888 GitHub"
            >
              <FaGithub className="text-xl" />
            </a>
            <span className="text-xs font-mono tracking-wide">6552410003</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
