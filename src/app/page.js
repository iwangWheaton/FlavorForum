"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
//this is the homepage 
export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <div className="tag-mock-screen mt-8">
        <header>
          <h1 className="text-2xl font-bold">Search for recipes through tags</h1>
        </header>
        <main className="flex gap-4 mt-4">
          <a href="easy.html">
            <button className="nav-button bg-gray-200 p-2 rounded">Easy</button>
          </a>
          <a href="sweet.html">
            <button className="nav-button bg-gray-200 p-2 rounded">Sweet</button>
          </a>
          <a href="lunch.html">
            <button className="nav-button bg-gray-200 p-2 rounded">Lunch</button>
          </a>
        </main>
      </div>
      <h1 className="text-3xl font-bold">Welcome to Flavor Forum</h1>
      <p className="text-gray-600">Find and share amazing recipes with your community.</p>
      <div className="flex gap-4">
        <button onClick={() => router.push("/login")} className="bg-blue-500 text-white p-3 rounded">
          Login
        </button>
        <button onClick={() => router.push("/signup")} className="bg-green-500 text-white p-3 rounded">
          Sign Up
        </button>
      </div>
      
    </div> 
  );
}
