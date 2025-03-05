"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

const sampleCommunities = [
  { id: "1", name: "Healthy Eats", location: "Chicago, IL" },
  { id: "2", name: "Spicy Lovers", location: "New York, NY" },
  { id: "3", name: "Baking Masters", location: "Los Angeles, CA" },
];

export default function JoinCommunity() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Detected Location:", position.coords);
          setCommunities(sampleCommunities);
        },
        () => {
          setLocationDenied(true);
          setCommunities(sampleCommunities); 
        }
      );
    } else {
      setLocationDenied(true);
      setCommunities(sampleCommunities);
    }
  }, []);
  
  //for when we use databases
  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const { latitude, longitude } = position.coords;
  //       fetch(`/api/communities?lat=${latitude}&lng=${longitude}`)
  //         .then((res) => res.json())
  //         .then((data) => setCommunities(data))
  //         .finally(() => setLoading(false));
  //     },
  //     () => {
  //       setLoading(false);
  //     }
  //   );
  // }, []);

  const handleSearch = async () => {
    setLoading(true);
    fetch(`/api/communities?search=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => setCommunities(data))
      .finally(() => setLoading(false));
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
