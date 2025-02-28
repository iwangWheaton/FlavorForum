"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CommunityPage({ params }) {
  const { communityId } = params;
  const { data: session } = useSession();
  const router = useRouter();
  
  // Sample community data (should match `join/page.js`)
  const sampleCommunities = {
    "1": { name: "Healthy Eats", description: "A place for nutritious and delicious meals." },
    "2": { name: "Spicy Lovers", description: "For those who love an extra kick in their food." },
    "3": { name: "Baking Masters", description: "For passionate bakers sharing their best recipes." },
  };

  const community = sampleCommunities[communityId];

  if (!community) {
    return <p className="text-red-500 p-6">Community not found.</p>;
  }

  const handleJoin = () => {
    if (!session) {
      router.push(`/auth/login?redirect=/main/community/${communityId}`);
      return;
    }
    alert(`Joined ${community.name}!`); // Replace with API call later
    router.push("/main/community/feed");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{community.name}</h1>
      <p className="text-gray-700">{community.description}</p>
      <button onClick={handleJoin} className="bg-blue-500 text-white p-2 rounded mt-2">
        Join Community
      </button>
    </div>
  );
}