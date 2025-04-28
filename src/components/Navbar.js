"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa"; // Default profile icon
import { FaPlus } from "react-icons/fa"; // Plus icon for the button

const Navbar = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Prep for Algolia search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleResultClick = (objectID) => {
    router.push(`/recipes/${objectID}`);
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === "/" || path === "/main") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="text-orange">
      {/* Top Level Navbar */}
      <div className="flex justify-between items-center p-4">
        {/* Website Title */}
        <Link href="/">
          <Image alt="logo" src="/images/FlavorForum.png" width={200} height={70} />
        </Link>

        {/* Search Bar */}
        <div className="relative w-1/2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for recipes..."
            className="w-full border rounded-lg p-2 text-gray/30"
          />
          {results.length > 0 && (
            <div className="absolute bg-white border rounded-lg shadow-md mt-2 w-full max-h-60 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.objectID}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleResultClick(result.objectID)}
                >
                  <p className="text-sm font-bold">{result.title}</p>
                  <p className="text-xs text-gray-500">{result.cuisine || "Unknown Cuisine"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile/Login Button */}
        <div className="relative profile-dropdown hover:bg-gray">
          {session ? (
            <div
              className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                isDropdownOpen ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300"
                />
              ) : (
                <FaUserCircle size={32} className="text-gray-300" />
              )}
              <span>{session.user.name}</span>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          )}
          {isDropdownOpen && session && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg w-40 p-2">
              <Link href="/main/profile">
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  Go to Profile
                </div>
              </Link>
              <div
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => signOut()}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second Level Navbar */}
      <div className="p-2 mt-2 flex justify-center items-center">
        <div className="bg-gray/10 inline-flex px-8 py-3 rounded-full gap-8">
          {/* Home/Main Button */}
          <Link 
            href={session ? "/main" : "/"} 
            className={`hover:text-gray relative px-2 ${
              (session && isActive("/main")) || (!session && isActive("/")) 
                ? "text-red" 
                : ""
            }`}
          >
            {session ? "Main" : "Home"}
            {/* Active indicator */}
            {(session && isActive("/main")) || (!session && isActive("/")) ? (
              <span className="absolute bottom-0 left-0 w-full h-0.2 bg-red rounded-full"></span>
            ) : null}
          </Link>

          {/* Recipes Button */}
          <Link 
            href="/main/recipes" 
            className={`hover:text-gray relative px-2 ${
              isActive("/main/recipes") ? "text-red" : ""
            }`}
          >
            Recipes
            {/* Active indicator */}
            {isActive("/main/recipes") ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red rounded-full"></span>
            ) : null}
          </Link>

          {/* Communities Button */}
          <Link 
            href="/main/community" 
            className={`hover:text-gray relative px-2 ${
              isActive("/main/community") ? "text-red" : ""
            }`}
          >
            Communities
            {/* Active indicator */}
            {isActive("/main/community") ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red rounded-full"></span>
            ) : null}
          </Link>

          {/* Saved Recipes Button */}
          <Link 
            href="/main/profile/boards" 
            className={`hover:text-gray relative px-2 ${
              isActive("/main/profile/boards") ? "text-red" : ""
            }`}
          >
            Saved
            {/* Active indicator */}
            {isActive("/main/profile/boards") ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red rounded-full"></span>
            ) : null}
          </Link>

          {/* Profile Button */}
          <Link 
            href="/main/profile" 
            className={`hover:text-gray relative px-2 ${
              isActive("/main/profile") ? "text-red" : ""
            }`}
          >
            Profile
            {/* Active indicator */}
            {isActive("/main/profile") ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red rounded-full"></span>
            ) : null}
          </Link>
        </div>

        {/* Create Recipe Button */}
        <Link
          href={session ? "/main/recipes/new" : "/signup"} // Redirect to sign-up if not signed in
          className="ml-4 flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-full hover:bg-red"
        >
          <FaPlus size={16} />
          Create Recipe
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;