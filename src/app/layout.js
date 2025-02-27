import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import Navbar from "@/components/Navbar";
import ClientSessionProvider from "./ClientSessionProvider";

const geistSans = Geist({
  subsets: ["latin"],
  display: 'swap',  // Add display swap for better loading
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: 'swap',  // Add display swap for better loading
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Flavor Forum",
  description: "Find and share amazing recipes with your community",
};

export default function RootLayout({ children }) {
  return (
    <ClientSessionProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar /> 
          <main className="flex-grow p-6">{children}</main>
        </body>
      </html>
    </ClientSessionProvider>
  );
}