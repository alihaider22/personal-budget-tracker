"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="w-4 h-4" />;
    }
    return theme === "dark" ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sun className="w-4 h-4" />
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
        <span className="hidden sm:inline">{getThemeLabel()}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-50 bg-card border-border">
          <div className="py-1">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                theme === "light"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Sun className="w-4 h-4 mr-3" />
              Light
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                theme === "dark"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Moon className="w-4 h-4 mr-3" />
              Dark
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                theme === "system"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Monitor className="w-4 h-4 mr-3" />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
