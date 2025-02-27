"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

//this is the homepage 
export default function Home() {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: 'white', color: '#171717' }} className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-3xl font-bold">Welcome to Flavor Forum</h1>
      <p className="text-gray-600">Find and share amazing recipes with your community.</p>
      <div className="flex gap-4">
        <div className="flex gap-4">
          <Button onClick={() => router.push("/login")}>
              Browse Recipes
          </Button>
        </div>
        <Button onClick={() => router.push("/login")} className="!bg-blue">
          Login
        </Button>
        <button onClick={() => router.push("/signup")} className="bg-green-500 text-white p-3 rounded">
          Sign Up
        </button>
      </div>


      <div className="tag-mock-screen mt-8">
        <header>
          <h1 className="text-2xl font-bold">Browse Recipes</h1>
        </header>
        <main className="flex gap-4 mt-4">
          <button 
            onClick={() => router.push("/tags/easy")} 
            className="nav-button bg-gray-200 p-2 rounded"
          >
            Easy
          </button>
          <button 
            onClick={() => router.push("/tags/sweet")} 
            className="nav-button bg-gray-200 p-2 rounded"
          >
            Sweet
          </button>
          <button 
            onClick={() => router.push("/tags/lunch")} 
            className="nav-button bg-gray-200 p-2 rounded"
          >
            Lunch
          </button>
        </main>
      </div>
    </div> 
  );
}