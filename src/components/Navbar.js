"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="p-4 flex justify-between bg-gray text-white">
      <div className="flex gap-4">
        <Link href="/" className="text-white hover:text-blue">Home</Link>
        <Link href="/main/recipes" className="text-white hover:text-blue">Recipes</Link>
        <Link href="/main/community" className="text-white hover:text-blue">Community</Link>
        <Link href="/main/profile" className="text-white hover:text-blue">Profile</Link>
      </div>
      
      <div className="flex gap-4 items-center">
        <Link href="/main/community">
          <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">Join Community</button>
        </Link>
        <Link href="/main/recipes/new">
          <button className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600">Create Recipe</button>
        </Link>
        {session ? (
          <>
            <span className="mr-4 text-white">Welcome, {session.user.name}</span>
            <button onClick={() => signOut()} className="bg-red text-white px-4 py-2 rounded hover:opacity-90">Logout</button>
          </>
        ) : (
          <button onClick={() => signIn()} className="bg-blue text-gray px-4 py-2 rounded hover:opacity-90">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
