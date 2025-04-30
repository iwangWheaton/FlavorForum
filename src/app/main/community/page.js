"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Button from "@/components/Button";
import Image from "next/image";

export default function JoinCommunity() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]); // Store all communities
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "communities"));
        const communitiesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunities(communitiesList);
        setAllCommunities(communitiesList); // Save the full list of communities
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async () => {
          fetchCommunities();
        },
        () => {
          setLocationDenied(true);
          fetchCommunities();
        }
      );
    } else {
      setLocationDenied(true);
      fetchCommunities();
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      // Reset to show all communities if the search query is empty
      setCommunities(allCommunities); // Reset to the full list of communities
    } else {
      setCommunities(
        allCommunities.filter((community) =>
          community.name.toLowerCase().startsWith(query)
        )
      );
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto p-4 bg-background">
        <h1 className="text-2xl font-bold">Join a Community</h1>
        {locationDenied && (
          <p className="text-red-500 mt-2">
            Location access denied. Showing all communities.
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for a community..."
            className="border p-2 w-full text-black"
          />
          <Button
            onClick={() => router.push("/main/community/create")}
            className="bg-green-500 text-white p-2 ml-4"
          >
            Create Your Own Community
          </Button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="mt-4">
            {communities.map((community) => (
              <li
                key={community.id}
                className={`bg-white p-4 border rounded mb-2 flex items-center ${
                  community.isTentative ? "opacity-50" : ""
                }`}
              >
                {community.image && (
                  <Image
                    src={community.image}
                    alt={community.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                  />
                )}
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">
                    {community.name} {community.isTentative && "(Tentative)"}
                  </h2>
                  <p className="text-gray">
                    {community.isTentative
                      ? "New community! Join to help get it published."
                      : community.location}
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/main/community/${community.id}`)}
                  className={`p-2 rounded ${
                    community.isTentative
                      ? "bg-gray-400 text-gray-700 "
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {community.isTentative ? "Endorse Community" : "View Community"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
