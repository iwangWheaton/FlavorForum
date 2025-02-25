"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="p-4 flex justify-between bg-gray-900 text-white">
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/main/recipes">Recipes</Link>
        <Link href="/main/community">Community</Link>
        <Link href="/main/profile">Profile</Link>
      </div>
      
      <div>
        {session ? (
          <>
            <span className="mr-4">Welcome, {session.user.name}</span>
            <button onClick={() => signOut()} className="bg-red-500 px-4 py-2 rounded">Logout</button>
          </>
        ) : (
          <button onClick={() => signIn()} className="bg-blue-500 px-4 py-2 rounded">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
