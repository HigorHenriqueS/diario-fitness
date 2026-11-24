import React from "react";
import AppSidebar from "../../layouts/AppSidebar";
import Backdrop from "../../layouts/Backdrop";
import Header from "../../layouts/AppHeader";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />

      <div className="flex-1 xl:ml-[290px]">
        <Header />

        <main className="p-4 mx-auto max-w-screen-2xl md:p-6">
          {children}
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
        </main>
      </div>
    </div>
  );
}
