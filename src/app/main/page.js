"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, orderBy, setDoc, updateDoc, increment } from "firebase/firestore";
import Button from "@/components/Button";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Feed from "@/components/Feed";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to homepage if not signed in
  useEffect(() => {
    if (!session) {
      router.push("/"); // Redirect to homepage
    }
  }, [session, router]);

  // Get the first name
  const fullName = session?.user?.name || "Chef";
  const firstName = fullName.split(" ")[0];

  // State for sorting options
  const [selectedOption, setSelectedOption] = useState("recent");

  // State for toggling the left-side navigation
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // State for posts
  const [posts, setPosts] = useState([]);

  // State for the create post modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(() => {
    if (typeof window !== "undefined") {
      // Access localStorage only in the browser
      return localStorage.getItem("selectedCommunity") || "all";
    }
    return "all"; // Default value for server-side rendering
  });
  const [selectedRecipe, setSelectedRecipe] = useState("");

  // State for user's joined communities and recipes
  const [userCommunities, setUserCommunities] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);

  // Fetch user's joined communities
  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (!session?.user?.uid) return;

      try {
        const communitiesRef = collection(db, "users", session.user.uid, "communities");
        const querySnapshot = await getDocs(communitiesRef);
        const communities = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const communityRef = doc(db, "communities", docSnapshot.id);
            const communitySnap = await getDoc(communityRef);
            return {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              isTentative: communitySnap.exists() ? communitySnap.data().isTentative : false,
            };
          })
        );
        setUserCommunities(communities);
      } catch (error) {
        console.error("Error fetching user's communities:", error);
      }
    };

    fetchUserCommunities();
  }, [session]);

  // Fetch posts based on the selected community
  const fetchPosts = async () => {
    try {
      const allPosts = [];
      if (selectedCommunity === "all") {
        // Fetch posts from all communities
        for (const community of userCommunities) {
          const postsRef = collection(db, "communities", community.id, "posts");
          const querySnapshot = await getDocs(postsRef);
          const communityPosts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            communityId: community.id,
            ...doc.data(),
          }));
          allPosts.push(...communityPosts);
        }
      } else {
        // Fetch posts from the selected community
        const postsRef = collection(db, "communities", selectedCommunity, "posts");
        const querySnapshot = await getDocs(postsRef);
        const communityPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          communityId: selectedCommunity,
          ...doc.data(),
        }));
        allPosts.push(...communityPosts);
      }

      // Sort posts based on the selected option
      if (selectedOption === "recent") {
        allPosts.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
      } else if (selectedOption === "trending") {
        allPosts.sort((a, b) => b.likes - a.likes);
      }

      console.log("Fetched posts:", allPosts);
      setPosts(allPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [session, userCommunities, selectedOption, selectedCommunity]);

  const fetchUserRecipes = async () => {
    if (!session?.user?.uid) return;

    try {
      const recipesRef = collection(db, "users", session.user.uid, "recipes");
      const querySnapshot = await getDocs(recipesRef);
      const recipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserRecipes(recipes);
    } catch (error) {
      console.error("Error fetching user's recipes:", error);
    }
  };

  useEffect(() => {
    fetchUserRecipes();
  }, [session]);

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunity(communityId);
    if (typeof window !== "undefined") {
      // Save the selection to localStorage only in the browser
      localStorage.setItem("selectedCommunity", communityId);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!session || !session.user) {
      alert("You must be logged in to create a post.");
      return;
    }

    if (!newPostContent || !selectedCommunity) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      let imageUrl = null;

      // Upload the image to Firebase Storage if an image is selected
      if (newPostImage) {
        const storage = getStorage(); // Initialize Firebase Storage
        const storageRef = ref(storage, `images/${newPostImage.name}`);
        const snapshot = await uploadBytes(storageRef, newPostImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Fetch the community name based on the selectedCommunity ID
      const communityRef = doc(db, "communities", selectedCommunity);
      const communitySnap = await getDoc(communityRef);
      const communityName = communitySnap.exists() ? communitySnap.data().name : "Unknown Community";

      // Fetch the selected recipe details
      const recipeDetails = userRecipes.find((recipe) => recipe.id === selectedRecipe);

      // Create the post data
      const postData = {
        content: newPostContent,
        image: imageUrl, // Store the image URL
        userName: session.user.name || "Anonymous",
        userProfilePicture: session.user.image,
        communityName: communityName, // Use the fetched community name
        recipeId: selectedRecipe,
        recipeTitle: recipeDetails?.title || null,
        recipeImage: recipeDetails?.imageUrl || null, // Use imageUrl instead of image
        timestamp: serverTimestamp(),
        likes: 0,
        comments: [],
      };

      // Add post to the community's posts subcollection
      const postRef = await addDoc(collection(db, "communities", selectedCommunity, "posts"), postData);

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
  const handleLike = async (postId, communityId) => {
    if (!session || !session.user) {
      alert("You must be logged in to like a post.");
      return;
    }

    try {
      const userLikeRef = doc(db, "likes", postId);
      const userLikeSnap = await getDoc(userLikeRef);

      if (userLikeSnap.exists()) {
        alert("You have already liked this post.");
        return;
      }

      // Reference the post in the community's posts subcollection
      const postRef = doc(db, "communities", communityId, "posts", postId);

      // Increment the like count in the database
      await updateDoc(postRef, {
        likes: increment(1),
      });

      // Update the like count in the main posts collection
      const mainPostRef = doc(db, "posts", postId);
      await updateDoc(mainPostRef, {
        likes: increment(1),
      });

      // Record the like in the user's likes subcollection
      await setDoc(userLikeRef, { likedAt: serverTimestamp() });

      // Refetch posts to reflect the updated like count
      await fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like the post. Please try again.");
    }
  };

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
            <li
              className="p-2 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
              onClick={() => router.push("/main/recipes/trending")} // Link to trending recipes
            >
              Popular
            </li>
          </ul>
          <ul className="space-y-2">
          <h2 className="text-sm font-semibold mt-4">Your Communities</h2>
            <li
              className={`p-2 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-300 ${
                selectedCommunity === "all" ? "bg-blue-500 text-blue" : ""
              }`}
              onClick={() => handleCommunitySelect("all")}
            >
              All Communities
            </li>
            {userCommunities.map((community) => (
              <li
                key={community.id}
                className="p-2 bg-gray-200 rounded flex items-center hover:bg-gray-300"
              >
                <span
                  className={`cursor-pointer ${
                    selectedCommunity === community.id ? "text-blue font-semibold" : ""
                  }`}
                  onClick={() => handleCommunitySelect(community.id)}
                >
                  {community.name}
                </span>
                {!community.isTentative && (
                  <button
                    onClick={() => router.push(`/main/community/${community.id}`)}
                    className="bg-blue text-white px-2 py-1 rounded hover:bg-red ml-2"
                  >
                    &gt;
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}

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
          <Button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Post
          </Button>
        </div>

        {/* Feed Component */}
        <Feed
          posts={posts.map((post) => ({
            ...post,
            userProfilePicture: post.userProfilePicture || "/images/default-profile.png", // Fallback for user profile picture
          }))}
          handleLike={(postId) => handleLike(postId, selectedCommunity)}
        />
      </section>

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
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
            >
              <option className="text-black" value="">Select a community</option>
              {userCommunities.map((community) => (
                <option className="text-black" key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
            >
              <option className="text-black" value="">Select a recipe (optional)</option>
              {userRecipes.map((recipe) => (
                <option className="text-black" key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
            <Button
              onClick={handleCreatePost}
              className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}