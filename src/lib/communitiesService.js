"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";


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
        const communitiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesList);
      } catch (error) {
        console.error("Error fetching communities: ", error);
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Detected Location:", position.coords);
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
    fetch(`/api/communities?search=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setCommunities(data))
      .finally(() => setLoading(false));
  };

  const addCommunityToFirestore = async (community) => {
    try {
      const docRef = await addDoc(collection(db, "communities"), community);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleAddCommunities = async () => {
    for (const community of sampleCommunities) {
      await addCommunityToFirestore(community);
    }
    alert("Communities added to Firestore!");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Join a Community</h1>
      {locationDenied && (
        <p className="text-red-500 mt-2">Location access denied. Showing sample communities.</p>
      )}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a community..."
        className="border p-2 mt-2 w-full text-black"
      />
      <Button onClick={handleSearch} className="bg-blue-500 text-black p-2 mt-2">
        Search
      </Button>
      <Button onClick={handleAddCommunities} className="bg-green-500 text-white p-2 mt-2">
        Add Sample Communities to Firestore
      </Button>
      {loading && <p>Loading...</p>}
      
      <ul className="mt-4">
        {communities.map((community) => (
          <li key={community.id} className="p-4 border rounded mb-2">
            <h2 className="text-lg font-semibold">{community.name}</h2>
            <h2 className="text-gray-600">{community.location}</h2>
            <Button 
              onClick={() => router.push(`/main/community/${community.id}`)} 
              className="bg-green-500 text-white p-2 rounded mt-2">
              View Community 
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}