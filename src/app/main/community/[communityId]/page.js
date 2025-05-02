"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, deleteDoc, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Feed from "@/components/Feed";

export default function CommunityPage({ params: paramsPromise }) {
  const { data: session } = useSession();
  const [params, setParams] = useState(null);
  const [joined, setJoined] = useState(false);
  const [community, setCommunity] = useState(null);
  const [feedSort, setFeedSort] = useState("recent");
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);

  const handleJoin = async () => {
    if (!session || !session.user) {
      alert("You must be logged in to join a community.");
      return;
    }

    try {
      const userCommunityRef = doc(db, "users", session.user.uid, "communities", params.communityId);
      const communityRef = doc(db, "communities", params.communityId);

      // Add the user to the community's members
      await setDoc(userCommunityRef, {
        joinedAt: serverTimestamp(),
      });

      // Increment the community's member count
      const communitySnap = await getDoc(communityRef);
      const currentNumMembers = communitySnap.exists() ? communitySnap.data().numMembers || 0 : 0;

      await updateDoc(communityRef, {
        numMembers: increment(1),
      });

      // If the community reaches 2 members, update isTentative to false
      if (currentNumMembers + 1 >= 2 && communitySnap.data().isTentative) {
        await updateDoc(communityRef, {
          isTentative: false,
        });
        alert("The community is now published and has its own feed!");
      }

      setJoined(true);
      alert("You have successfully joined the community!");
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Failed to join the community. Please try again.");
    }
  };

  const handleLeave = async () => {
    if (!session || !session.user) {
      alert("You must be logged in to leave a community.");
      return;
    }

    try {
      const userCommunityRef = doc(db, "users", session.user.uid, "communities", params.communityId);
      const communityRef = doc(db, "communities", params.communityId);

      // Remove the user from the community's members
      await deleteDoc(userCommunityRef);

      // Decrement the community's member count
      await updateDoc(communityRef, {
        numMembers: increment(-1),
      });

      setJoined(false);
      alert("You have successfully left the community.");
    } catch (error) {
      console.error("Error leaving community:", error);
      alert("Failed to leave the community. Please try again.");
    }
  };

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await paramsPromise;
      setParams(resolvedParams);
    };
    unwrapParams();
  }, [paramsPromise]);

  // Fetch community data
  useEffect(() => {
    if (!session || !session.user) return;
    if (params?.communityId) {
      const fetchCommunity = async () => {
        if (!params?.communityId) return;

        try {
          const docRef = doc(db, "communities", params.communityId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCommunity({ id: docSnap.id, ...docSnap.data() });

            // Check if the user has joined the community
            const userCommunityRef = doc(db, "users", session.user.uid, "communities", params.communityId);
            const userCommunitySnap = await getDoc(userCommunityRef);
            setJoined(userCommunitySnap.exists());
          }
        } catch (error) {
          console.error("Error fetching community:", error);
        }
      };

      fetchCommunity();
    }
  }, [session, params]);

  // Fetch posts for the community
  const fetchPosts = async () => {
    if (!params?.communityId) return;

    try {
      let postsRef = collection(db, "communities", params.communityId, "posts");

      // Apply sorting based on the selected option
      if (feedSort === "recent") {
        postsRef = query(postsRef, orderBy("timestamp", "desc"));
      }

      const querySnapshot = await getDocs(postsRef);
      const communityPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(communityPosts); // Only posts for the specific community
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [params, feedSort]);

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPostContent) {
      alert("Please fill in the post content.");
      return;
    }

    try {
      let imageUrl = null;

      // Upload the image to Firebase Storage if an image is selected
      if (newPostImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${newPostImage.name}`);
        const snapshot = await uploadBytes(storageRef, newPostImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create the post data
      const postData = {
        content: newPostContent,
        image: imageUrl,
        userName: session?.user?.name || "Anonymous",
        userProfilePicture: session?.user?.image || "/images/default-profile.png",
        timestamp: serverTimestamp(),
        likes: 0,
        comments: [],
      };

      // Add post to the community's posts subcollection
      const postRef = await addDoc(collection(db, "communities", params.communityId, "posts"), postData);

      // Add post to the main posts collection
      const mainPostRef = doc(db, "posts", postRef.id);
      await setDoc(mainPostRef, { ...postData, id: postRef.id });

      // Add post to the user's posts subcollection
      const userPostRef = doc(db, "users", session.user.uid, "posts", postRef.id);
      await setDoc(userPostRef, { ...postData, id: postRef.id });

      console.log("Post created with ID:", postRef.id);

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Handle liking a post
 

  if ( !community) {
    return <h1 className="text-gray-500 p-6">Loading...</h1>;
  }

  return (
    <div className="bg-background">
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        {/* Community Banner */}
        <div className="relative w-full h-64">
          <Image
            src={community.image}
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

        {/* Tentative Community Message */}
        {community.isTentative && (
          <div className="mt-6 bg-yellow-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-yellow-800">This community is tentative!</h2>
            <p className="text-black mt-2">
              Join this community to endorse it so it can get published. This community needs at least 
              <strong> 2 people</strong> to endorse it in order to be published and have its own feed!
            </p>
          </div>
        )}

        {/* Posts Section */}
        <section className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Community Feed</h2>

          {/* Sorting Options */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4">
              {["recent", "popular"].map((option) => (
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Post
            </button>
          </div>

          {/* Feed Component */}
          {posts.length > 0 ? (
            <Feed
              posts={posts.map((post) => ({
                ...post,
                userProfilePicture: post.userProfilePicture || "/images/default-profile.png",
              }))}
              handleLike={(postId) => handleLike(postId)}
            />
          ) : (
            <p className="text-gray-500">No posts available. Be the first to post in this community!</p>
          )}
        </section>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {/* Close Button */}
            <Button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </Button>
            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-2 border rounded mb-4 text-black"
            ></textarea>
            <input
              type="file"
              onChange={(e) => setNewPostImage(e.target.files[0])}
              className="mb-4 text-black"
            />
            <button
              onClick={handleCreatePost}
              className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}