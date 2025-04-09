import "./global.css";
import Navbar from "@/components/Navbar";
import ClientSessionProvider from "./ClientSessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
  title: "Flavor Forum",
  description: "Find and share amazing recipes with your community",
};

export default async function RootLayout({ children }) {
  // Fetch session on the server
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="antialiased bg-background">
        {/* Pass session to ClientSessionProvider */}
        <ClientSessionProvider session={session}>
          {/* Navbar is a client component */}
          <Navbar />
          <main className="flex-grow">{children}</main>
        </ClientSessionProvider>
      </body>
    </html>
  );
}