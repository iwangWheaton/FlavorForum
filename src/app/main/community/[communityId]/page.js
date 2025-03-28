"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { use } from "react";

export default function CommunityPage({ params }) {
  const resolvedParams = use(params); // Unwrap the params Promise
  const communityId = resolvedParams.communityId; // Access the unwrapped communityId
  const { data: session } = useSession();
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch community data from Firestore
  useEffect(() => {
    if (communityId) {
      const fetchCommunity = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "communities", communityId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCommunity({ id: docSnap.id, ...docSnap.data() }); // Includes the `image` field
          } else {
            console.error("No such community exists.");
          }
        } catch (error) {
          console.error("Error fetching community:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCommunity();
    }
  }, [communityId]);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      // Ensure the user is authenticated
      if (!session) {
        console.error("User is not authenticated.");
        return;
      }
  
      const storage = getStorage();
      const storageRef = ref(storage, `images/${communityId}/${file.name}`);
      console.log("Uploading file to path:", storageRef.fullPath);
  
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Uploaded a file:", snapshot);
  
      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File available at:", downloadURL);
  
      // Save the download URL to Firestore
      const communityRef = doc(db, "communities", communityId);
      await setDoc(
        communityRef,
        { image: downloadURL }, // Add or update the `image` field
        { merge: true } // Merge with existing data
      );
  
      // Update the community state with the new image URL
      setCommunity((prev) => ({ ...prev, image: downloadURL }));
      console.log("Image URL saved to Firestore!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading || !community) {
    return <h1 className="text-gray-500 p-6">Loading...</h1>; 
  }
  

  if (!community) {
    return <h1 className="text-red-500 p-6">Community not found.</h1>;
  }

  const handleJoin = () => {
    if (!session) {
      router.push(`/signup?redirect=/main/community/${communityId}`);
      return;
    }
    setJoined(true);
  };

  return (
    <div className="bg-background">
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Community Banner */}
      <div className="relative w-full h-64">
        <Image
          src={community.image || "/images/placeholder.jpg"} // Use placeholder if no image
          alt={community.name || "Community Image"}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{community.name}</h1>
        </div>
      </div>

      {/* Community Info Section */}
      <div className="mt-6 flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="text-gray-700 text-xl">{community.description}</h2>
          <h2 className="text-gray-600">{community.numMembers} members</h2>
        </div>
        <Button
          onClick={handleJoin}
          className={`p-2 rounded ${joined ? "bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          disabled={joined}
        >
          {joined ? "Joined" : "Join Community"}
        </Button>
      </div>

      {/* Image Upload Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Upload a New Image</h2>
        <input type="file" onChange={handleImageUpload} />
      </div>
    </div>
    </div>
  );
}