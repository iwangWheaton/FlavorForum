"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Button from "@/components/Button";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateCommunity = async () => {
    if (!name || !description || !location) {
      alert("Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload the image to Firebase Storage if an image is selected
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `community-images/${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create the community in a tentative state
      const communityData = {
        name,
        description,
        location,
        image: imageUrl,
        numMembers: 0, // Start with 0 members
        isTentative: true, // Mark as tentative
        createdAt: serverTimestamp(),
      };

      // Add the community to the database
      await addDoc(collection(db, "communities"), communityData);

      alert("Community created successfully! Waiting for members to join.");
      router.push("/main/community"); // Redirect to the Join Community page
    } catch (error) {
      console.error("Error creating community:", error);
      alert("Failed to create the community. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Create a Community</h1>
        <p className="text-black mb-4">
          Communities start in a tentative state. They need at least <strong>3 members</strong> to join before they are published and get their own feed.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Community Name"
          className="w-full p-2 border rounded mb-4 text-black"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Community Description"
          className="w-full p-2 border rounded mb-4 text-black"
        ></textarea>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full p-2 border rounded mb-4 text-black"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4 text-black"
        />
        <Button
          onClick={handleCreateCommunity}
          className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 text-white"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Community"}
        </Button>
      </div>
    </div>
  );
}
