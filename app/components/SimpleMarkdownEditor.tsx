"use client";

import React, { ChangeEvent } from "react";

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const SimpleMarkdownEditor: React.FC<SimpleMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content here (Markdown supported)...",
  rows = 10,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-pink-500 focus:border-blue-500 dark:focus:border-pink-500"
      // Basic styling for a textarea, adjust as needed
    />
  );
};

export default SimpleMarkdownEditor;