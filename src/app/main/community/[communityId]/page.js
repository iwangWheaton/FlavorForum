"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, deleteDoc, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CommunityPage({ params: paramsPromise }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [params, setParams] = useState(null);
  const [joined, setJoined] = useState(false);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedSort, setFeedSort] = useState("recent");
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);

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
        setLoading(true);
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
        } finally {
          setLoading(false);
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
      setPosts(communityPosts);
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
        userProfilePicture: session?.user?.image || "/default-profile.png",
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

      // Refetch posts to refresh the feed
      await fetchPosts();

      setIsModalOpen(false);
      setNewPostContent("");
      setNewPostImage(null);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Handle liking a post
  const handleLike = async (postId) => {
    try {
      // Reference the post in the community's posts subcollection
      const postRef = doc(db, "communities", params.communityId, "posts", postId);

      // Increment the like count in the database
      await updateDoc(postRef, {
        likes: increment(1),
      });

      // Update the like count in the main posts collection
      const mainPostRef = doc(db, "posts", postId);
      await updateDoc(mainPostRef, {
        likes: increment(1),
      });

      // Refetch posts to reflect the updated like count
      await fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  if (loading || !community) {
    return <h1 className="text-gray-500 p-6">Loading...</h1>;
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

          {/* Posts Section */}
          <div className="space-y-4 text-black">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center mb-2">
                  <Image
                    src={post.userProfilePicture}
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <h2 className="text-sm font-semibold">{post.userName}</h2>
                    <h2 className="text-xs text-gray-500">
                      {post.timestamp?.toDate().toLocaleString()}
                    </h2>
                  </div>
                </div>
                <h3 className="text-lg font-bold">{post.content}</h3>
                {post.image && (
                  <Image
                    src={post.image}
                    alt="Post Image"
                    width={100}
                    height={100}
                    className="rounded mt-2"
                  />
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="text-blue-500 hover:underline"
                  >
                    Like ({post.likes})
                  </button>
                  <button className="text-blue-500 hover:underline">Comment</button>
                </div>
              </div>
            ))}
          </div>
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
              className="mb-4"
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