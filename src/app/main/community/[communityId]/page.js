"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";

export default function CommunityPage({ params }) {
  const [communityId, setCommunityId] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  
  // Sample community data (should match `join/page.js`)
  const sampleCommunities = {
    "1": { name: "Healthy Eats", description: "A place for nutritious and delicious meals.", image: "/images/spicy.jpg" },
    "2": { name: "Spicy Lovers", description: "For those who love an extra kick in their food.", image: "/images/spicy.jpg" },
    "3": { name: "Baking Masters", description: "For passionate bakers sharing their best recipes.", image: "/images/bake.png" },
  };

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setCommunityId(resolvedParams.communityId);
    }
    fetchParams();
  }, [params]);

  const community = sampleCommunities[communityId];

  if (!community) {
    return <p className="text-red-500 p-6">Community not found.</p>;
  }

  const handleJoin = () => {
    console.log("Session stat:", session);
    if (!session) {
      router.push(`/signup?redirect=/main/community/${communityId}`);
      return;
    }
    alert(`Joined ${community.name}!`); // Replace with API call later
    router.push("/main/community/feed");
  };

  return (
    <div className="p-6">
      <div className="relative w-full h-64">
        <Image src={community.image} alt={community.name} layout="fill" objectFit="cover" className="rounded-lg" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{community.name}</h1>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-gray-700">{community.description}</h2>
        <Button onClick={handleJoin} className="bg-blue-500 text-white p-2 rounded mt-2">
          Join Community
        </Button>
      </div>
    </div>
  );
}