"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

//this is the homepage 
export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
    <div className="w-full relative">
      <div className="w-full h-[500px] relative">
        <Image 
          src="/images/background.avif"
          alt="food background"
          fill
          priority
          style={{objectFit: 'cover'}}
          className="brightness-[0.7]"
        />
        </div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="bg-white/90 p-8 rounded-lg max-w-3xl">
            <h1 className="text-5xl font-bold text-black">Welcome to Flavor Forum</h1>
            <p className="text-gray mt-4 text-lg">
              Find, organize, and share amazing recipes with your community.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => router.push("/login")} className="!bg-blue">
                Login
              </Button>
              <Button onClick={() => router.push("/signup")}>
                Sign Up
              </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}