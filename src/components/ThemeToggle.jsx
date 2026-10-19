import { useEffect, useState } from "react";

const STORAGE_KEY = "tbq-theme";

const currentTheme = () => document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

// Floating sun/moon button that switches between dark (brand default) and light (for bright sunlight).
export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage can be blocked (private mode); the theme still works for this visit
    }
  }, [theme]);

  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode (better in sunlight)"}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-card border-2 border-brand text-xl shadow-lg flex items-center justify-center hover:scale-105 transition"
    >
      <span aria-hidden="true">{isLight ? "🌙" : "☀️"}</span>
    </button>
  );
}
