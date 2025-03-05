"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@/components/Button";

// Mock feed 
const feed = [
  {
    id: 1,
    user: "Alex",
    content: "Check out this amazing avocado toast recipe!",
    image: "/images/avacado.jpg"
  },
  {
    id: 2,
    user: "Chris",
    content: "Best hot sauce recommendations? 🔥",
    image: "/images/sauce.jpg"
  }
];

// this is the homepage 
export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <div className="w-full relative">
        {!session && (
          <div className="w-full h-[800px] relative">
            <Image 
              src="/images/background.avif"
              alt="food background"
              fill
              priority
              style={{objectFit: 'cover'}}
              className="brightness-[0.7]"
            />
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
        )}
      </div>

      {session && (
        <div className="w-full h-full max-w-6xl mt-6">
          <h2 className="text-3xl font-bold mb-4">Your Feed</h2>
          {feed.map((post) => (
            <div key={post.id} className="bg-white p-4 mb-4 rounded-lg shadow-md">
              <h1 className="text-gray-900 font-semibold">{post.user}</h1>
              <h2 className="text-gray-700">{post.content}</h2>
              <Image src={post.image} alt={post.content} width={600} height={400} className="rounded-lg mt-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}