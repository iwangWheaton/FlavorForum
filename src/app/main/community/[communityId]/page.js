"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";

export default function CommunityPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [communityId, setCommunityId] = useState(null);
  
  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      setCommunityId(resolvedParams.communityId);
    }
    fetchParams();
  }, [params]);

  // Sample community data
  const sampleCommunities = {
    "1": {
      name: "Healthy Eats",
      description: "A place for nutritious and delicious meals.",
      image: "/images/spicy.jpg",
      members: 3421,
      posts: [
        { id: 1, user: "Alex", content: "Check out this amazing avocado toast recipe!" },
        { id: 2, user: "Jamie", content: "Anyone have a good meal prep plan for the week?" },
      ],
    },
    "2": {
      name: "Spicy Lovers",
      description: "For those who love an extra kick in their food.",
      image: "/images/spicy.jpg",
      members: 1876,
      posts: [
        { id: 1, user: "Chris", content: "Best hot sauce recommendations? 🔥" },
        { id: 2, user: "Jordan", content: "Just made a super spicy ramen, want the recipe?" },
      ],
    },
    "3": {
      name: "Baking Masters",
      description: "For passionate bakers sharing their best recipes.",
      image: "/images/bake.png",
      members: 2500,
      posts: [
        { id: 1, user: "Taylor", content: "This chocolate lava cake recipe is a must-try!" },
        { id: 2, user: "Morgan", content: "What’s your favorite gluten-free flour brand?" },
      ],
    },
  };

  const community = sampleCommunities[communityId];

  if (!community) {
    return <p className="text-red-500 p-6">Community not found.</p>;
  }

  const handleJoin = () => {
    if (!session) {
      router.push(`/signup?redirect=/main/community/${communityId}`);
      return;
    }
    setJoined(true);
    // alert(`Joined ${community.name}!`); Replace with API call later
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Community Banner */}
      <div className="relative w-full h-64">
        <Image src={community.image} alt={community.name} layout="fill" objectFit="cover" className="rounded-lg" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{community.name}</h1>
        </div>
      </div>

      {/* Community Info Section */}
      <div className="mt-6 flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-gray-700 text-xl">{community.description}</h2>
          <h2 className="text-gray-600">{community.members.toLocaleString()} members</h2>
        </div>
        <Button
          onClick={handleJoin}
          className={`p-2 rounded ${joined ? "bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          disabled={joined}
        >
          {joined ? "Joined" : "Join Community"}
        </Button>
      </div>

      {/* Community Feed */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        {community.posts.length > 0 ? (
          community.posts.map((post) => (
            <div key={post.id} className="bg-white p-4 mb-4 rounded-lg shadow-md">
              <h1 className="text-gray-900 font-semibold">{post.user}</h1>
              <h2 className="text-gray-700">{post.content}</h2>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        )}
      </div>
    </div>
  );
}