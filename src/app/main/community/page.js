"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function JoinCommunity() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "communities"),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const filteredCommunities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(filteredCommunities);
    } catch (error) {
      console.error("Error searching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
    <div className="container mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold">Join a Community</h1>
      {locationDenied && (
        <p className="text-red-500 mt-2">Location access denied. Showing all communities.</p>
      )}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a community..."
        className="border p-2 mt-2 w-full text-black"
      />
      <Button onClick={handleSearch} className="bg-blue-500 text-white p-2 mt-2">
        Search
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="mt-4">
          {communities.map((community) => (
            <li key={community.id} className="p-4 border rounded mb-2">
              <h2 className="text-lg font-semibold">{community.name}</h2>
              <p className="text-gray-600">{community.location}</p>
              <Button
                onClick={() => router.push(`/main/community/${community.id}`)}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                View Community
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
}
