import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import Navbar from "@/components/Navbar";
import ClientSessionProvider from "./ClientSessionProvider";

export const metadata = {
  title: "Flavor Forum",
  description: "Find and share amazing recipes with your community",
};

export default function RootLayout({ children }) {
  return (
    <ClientSessionProvider>
      <html lang="en">
        <body className="antialiased">
          <Navbar /> 
          <main className="flex-grow">{children}</main>
        </body>
      </html>
    </ClientSessionProvider>
  );
}