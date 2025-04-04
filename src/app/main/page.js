"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function MainPage() {
  const { data: session } = useSession();

  // Get the first name
  const fullName = session?.user?.name || "Chef";
  const firstName = fullName.split(" ")[0];

  // State for sorting options
  const [selectedOption, setSelectedOption] = useState("recent");

  // State for toggling the left-side navigation
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Mock data for communities and posts
  const communities = ["Baking", "Grilling", "Vegan", "Desserts", "Quick Meals"];
  const posts = [
    { id: 1, title: "10 Best Vegan Recipes", author: "ChefJohn", timestamp: "2 hours ago" },
    { id: 2, title: "How to Grill the Perfect Steak", author: "GrillMaster", timestamp: "5 hours ago" },
    { id: 3, title: "Quick 15-Minute Meals", author: "FastCook", timestamp: "1 day ago" },
  ];

  return (
    <main className="flex bg-background">
      {/* Left-Side Navigation */}
      {isSidebarVisible && (
        <aside className="w-1/4 p-4 bg-gray-100 text-black">
          <h2 className="text-lg font-bold mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li className="p-2 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
              Home
            </li>
            <li className="p-2 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
              Popular
            </li>
            <li>
              <h3 className="text-sm font-semibold mt-4">Your Communities</h3>
              <ul className="space-y-1 mt-2">
                {communities.slice(0, 5).map((community, index) => (
                  <li
                    key={index}
                    className="p-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
                  >
                    {community}
                  </li>
                ))}
                {communities.length > 5 && (
                  <li className="p-2 text-blue-500 cursor-pointer hover:underline">
                    Show More
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </aside>
      )}

      {/* Divider with Toggle Button */}
      <div className="relative flex items-center ">
        <div className="h-full w-[2px] bg-gray"></div>
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="absolute -right-3 bg-black rounded-full p-1 shadow hover:bg-gray"
        >
          {isSidebarVisible ? "←" : "→"}
        </button>
      </div>

      {/* Main Content */}
      <section className="flex-grow p-6">
        {/* Welcome Message */}
        <h1 className="text-3xl font-bold mb-4 text-black">Welcome Back, {firstName}! 👨‍🍳</h1>

        {/* Sorting Options */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {["for you", "recent", "trending"].map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`px-4 py-2 rounded ${
                  selectedOption === option
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Post
          </button>
        </div>

        {/* Posts Section */}
        <div className="space-y-4 text-black">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer"
            >
              <h3 className="text-lg font-bold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                By {post.author} • {post.timestamp}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}