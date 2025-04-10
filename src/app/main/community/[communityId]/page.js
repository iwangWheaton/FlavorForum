"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, deleteDoc } from "firebase/firestore";

export default function CommunityPage({ params: paramsPromise }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [params, setParams] = useState(null); // State to store unwrapped params
  const [joined, setJoined] = useState(false);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [feedSort, setFeedSort] = useState("recent"); // State for feed sorting
  const [posts, setPosts] = useState([]); 

  const samplePosts = [
    { id: 1, title: "10 Best Vegan Recipes", author: "ChefJohn", timestamp: "2 hours ago" },
    { id: 2, title: "How to Grill the Perfect Steak", author: "GrillMaster", timestamp: "5 hours ago" },
    { id: 3, title: "Quick 15-Minute Meals", author: "FastCook", timestamp: "1 day ago" },
  ];
  
  // Unwrap params
  useEffect(() => {
    
    const unwrapParams = async () => {
      const resolvedParams = await paramsPromise;
      console.log("Resolved Params:", resolvedParams);
      setParams(resolvedParams);
    };
    unwrapParams();
    
  }, [paramsPromise]);

  // Fetch community data from Firestore
  useEffect(() => {
    setPosts(samplePosts);
    if (!session || !session.user) {
      console.error("User is not authenticated.");
      return;
    }
    if (params?.communityId) {
      const fetchCommunity = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "communities", params.communityId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCommunity({ id: docSnap.id, ...docSnap.data() });
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
  }, [session, params, feedSort]);
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;


    try {
      if (!session) {
        console.error("User is not authenticated.");
        return;
      }
      const storage = storage();
      const storageRef = ref(storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await downloadURL(storageRef);


      const communityRef = doc(db, "communities", communityId);
      await setDoc(
        communityRef,
        { image: downloadURL },
        { merge: true }
      );


      setCommunity((prev) => ({ ...prev, image: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };


  const handleJoin = async () => {
    console.log("Community ID:", params);
    if (!session || !session.user) {
      router.push(`/signup?redirect=/main/community/${params?.communityId || ""}`);
      return;
    }
  
    if (!params?.communityId || !community?.name) {
      console.error("Community ID or name is undefined.");
      return;
    }
  
    const userId = session.user.uid; // Use `uid` instead of `id`
  
    try {
      // Add community to user's subcollection
      console.log("User ID:", userId);
      console.log("Community ID:", params.communityId);
      const userRef = doc(db, "users", userId, "communities", params.communityId);
      console.log("User Reference:", userRef);

      await setDoc(userRef, {
        name: community.name,
        joinedAt: new Date(),
      });
      console.log("Community added to user's subcollection successfully!");

      // Add user to the community's members subcollection
      const memberRef = doc(db, "communities", params.communityId, "members", userId);
      console.log("Member Reference Path:", memberRef.path);

      console.log("Adding user to community's members subcollection...");
      await setDoc(memberRef, {
        joinedAt: new Date(),
      });

      // Add userId to the members array in the main community document
      const communityRef = doc(db, "communities", params.communityId);
      console.log("Adding userId to members array in the main community document...");
      await updateDoc(communityRef, {
        members: increment(1),
      });

      console.log("UserId added to members array successfully!");

      // Increment the community's member count
      console.log("Incrementing community member count...");
      await updateDoc(communityRef, {
        numMembers: increment(1),
      });
      console.log("Community member count incremented successfully!");

      setJoined(true);
      setShowPopup(true);
    } catch (error) {
      console.error("Error joining community:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  const handleLeave = async () => {
    console.log("Leaving community...");
    if (!session || !session.user) {
      console.error("User is not authenticated.");
      return;
    }
  
    if (!params?.communityId) {
      console.error("Community ID is undefined.");
      return;
    }
  
    const userId = session.user.uid;
  
    try {
      // Remove community from user's subcollection
      const userRef = doc(db, "users", userId, "communities", params.communityId);
      console.log("Removing community from user's subcollection...");
      await deleteDoc(userRef);
      console.log("Community removed from user's subcollection successfully!");
  
      // Remove user from the community's members subcollection
      const memberRef = doc(db, "communities", params.communityId, "members", userId);
      console.log("Removing user from community's members subcollection...");
      await deleteDoc(memberRef);
      console.log("User removed from community's members subcollection successfully!");
  
      // Decrement the community's member count
      const communityRef = doc(db, "communities", params.communityId);
      console.log("Decrementing community member count...");
      await updateDoc(communityRef, {
        numMembers: increment(-1),
      });
      console.log("Community member count decremented successfully!");
  
      setJoined(false);
    } catch (error) {
      console.error("Error leaving community:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  if (loading || !community) {
    return <h1 className="text-gray-500 p-6">Loading...</h1>;
  }

  if (!community) {
    return <h1 className="text-red-500 p-6">Community not found.</h1>;
  }

  return (
    <div className="bg-background">
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        {/* Community Banner */}
        <div className="relative w-full h-64">
          <Image
            src={community.image || "/images/placeholder.jpg"}
            alt={community.name || "Community Image"}
            fill
            style={{ objectFit: "cover" }}
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
            onClick={joined ? handleLeave : handleJoin}
            className={`p-2 rounded ${joined ? "bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            {joined ? "Leave Community" : "Join Community"}
          </Button>
        </div>
        <section className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Community Feed</h2>

          {/* Sorting Options */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4">
              {["hot", "recent", "popular"].map((option) => (
                <button
                  key={option}
                  onClick={() => setFeedSort(option)}
                  className={`px-4 py-2 rounded ${
                    feedSort === option
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
        {/* <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Upload a New Image</h2>
          <input type="file" onChange={handleImageUpload} />
        </div> */}

      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="relative w-full h-40 mb-4">
              <Image
                src={community.image || "/images/placeholder.jpg"}
                alt={community.name || "Community Image"}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-lg"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">{community.name}</h2>
            <h2 className="text-center mb-6">Welcome to the {community.name} community!</h2>
            <div className="flex justify-between">
              <Button
                onClick={() => setShowPopup(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Got it
              </Button>
              <Button
                onClick={() => router.push("/main")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}