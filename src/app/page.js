"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      
      <div className="flex flex-col gap-4">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={() => router.push("/screens/screen1")}
        >
          Go to Mockup 1
        </button>
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          onClick={() => router.push("/screens/screen2")}
        >
          Go to Mockup 2
        </button>
        <button
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => router.push("/screens/screen3")}
        >
          Go to Mockup 3
        </button>
      </div>
    </div>
  );
}
