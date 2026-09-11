import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "素材延展平台",
  description: "识别 Figma 母版、批量延展资源位与修改文案",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="h-full overflow-hidden">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
