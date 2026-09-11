"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const dark = ready && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={dark ? "切换到浅色" : "切换到深色"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      icon={dark ? <Sun size={14} /> : <Moon size={14} />}
    >
      {dark ? "浅色" : "深色"}
    </Button>
  );
}
