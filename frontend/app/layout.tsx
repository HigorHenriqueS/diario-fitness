import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "../context/SidebarContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu Projeto",
  description: "Projeto de estudo com Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
        <Toaster
          toastOptions={{
            classNames: {
              success: "bg-green-600! text-white!",
              error: "bg-red-600! text-white!",
              warning: "bg-yellow-500! text-white!",
              info: "bg-blue-600! text-white!",
            },
          }}
        />
      </body>
    </html>
  );
}