import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, getDoc, setDoc, collection, deleteDoc, getDocs, serverTimestamp, query, where, addDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FaUtensilSpoon } from "react-icons/fa"; // Whisk icon

export default function Feed({ posts, currentUserId }) {
  const [menuOpen, setMenuOpen] = useState(null); // Track which post's menu is open
  const [commentMenuOpen, setCommentMenuOpen] = useState({}); // Track which comment's menu is open
  const [comments, setComments] = useState({}); // Store comments for each post
  const [newComment, setNewComment] = useState({}); // Track new comments for each post
  const [expandedComments, setExpandedComments] = useState({}); // Track expanded state for each post
  const [likedPosts, setLikedPosts] = useState({}); // Track liked posts by the user
  const [localPosts, setLocalPosts] = useState(posts); // Manage posts locally
  const { data: session } = useSession();

  const fetchComments = async (postId) => {
    try {
      const commentsRef = collection(db, "posts", postId, "comments");
      const querySnapshot = await getDocs(commentsRef);
      const postComments = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate()); // Sort comments by oldest first
      setComments((prev) => ({ ...prev, [postId]: postComments }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]) return;

    try {
      const commentData = {
        content: newComment[postId],
        userName: session?.user?.name || "Anonymous",
        userProfilePicture: session?.user?.image || "/default-profile.png",
        timestamp: serverTimestamp(),
      };

      const commentsRef = collection(db, "posts", postId, "comments");
      await addDoc(commentsRef, commentData);

      setNewComment((prev) => ({ ...prev, [postId]: "" })); // Clear the input field
      fetchComments(postId); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const commentRef = doc(db, "posts", postId, "comments", commentId);
      await deleteDoc(commentRef);

      alert("Comment deleted successfully!");
      fetchComments(postId); // Refresh comments for the post
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete the comment. Please try again.");
    }
  };

  const handleDeletePost = async (postId, communityId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      // Delete all comments in the post's comments subcollection
      const commentsRef = collection(db, "communities", communityId, "posts", postId, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      const deletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the post from the community's posts subcollection
      await deleteDoc(doc(db, "communities", communityId, "posts", postId));

      // Delete the post from the main posts collection
      await deleteDoc(doc(db, "posts", postId));

      alert("Post and its comments deleted successfully!");
      window.location.reload(); // Refresh the page to update the feed
    } catch (error) {
      console.error("Error deleting post and its comments:", error);
      alert("Failed to delete the post. Please try again.");
    }
  };

  const fetchUserLikes = async () => {
    if (!session || !session.user) return;

    try {
      const likesRef = collection(db, "users", session.user.uid, "likes");
      const likedPostsSnapshot = await getDocs(likesRef);

      const userLikes = {};
      likedPostsSnapshot.forEach((doc) => {
        userLikes[doc.id] = true;
      });

      setLikedPosts(userLikes); // Update liked posts state
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  useEffect(() => {
    fetchUserLikes(); // Fetch user likes on component mount
  }, [session]);

  const handleLike = async (postId, communityId) => {
    if (!session || !session.user) {
      alert("You must be logged in to like or unlike a post.");
      return;
    }

    const userLikeRef = doc(db, "users", session.user.uid, "likes", postId);
    const postRef = doc(db, "posts", postId);
    const communityPostRef = doc(db, "communities", communityId, "posts", postId);

    if (likedPosts[postId]) {
      // Unlike the post
      try {
        // Optimistically update the UI
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLocalPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );

        // Remove the like from the user's likes subcollection
        await deleteDoc(userLikeRef);

        // Decrement the like count in Firestore
        await updateDoc(postRef, { likes: increment(-1) });
        await updateDoc(communityPostRef, { likes: increment(-1) });
      } catch (error) {
        console.error("Error unliking post:", error);

        // Revert the UI changes in case of an error
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLocalPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    } else {
      // Like the post
      try {
        // Optimistically update the UI
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        setLocalPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );

        // Add the like to the user's likes subcollection
        await setDoc(userLikeRef, { likedAt: serverTimestamp() });

        // Increment the like count in Firestore
        await updateDoc(postRef, { likes: increment(1) });
        await updateDoc(communityPostRef, { likes: increment(1) });
      } catch (error) {
        console.error("Error liking post:", error);

        // Revert the UI changes in case of an error
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        setLocalPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleString(undefined, {
      year: "2-digit", // Display only the last two digits of the year
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    posts.forEach((post) => {
      fetchComments(post.id); // Fetch comments for each post
    });
  }, [posts]);

  return (
    <div className="space-y-4 text-black">
      {localPosts.map((post) => (
        <div
          key={post.id}
          className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer relative"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Image
                src={post.userProfilePicture || "/images/default-profile.png"} // Fallback for user profile picture
                alt="User Profile"
                width={40}
                height={40}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div>
                <h2 className="text-sm font-semibold">{post.userName}</h2>
                <h2 className="text-xs text-gray-500">
                  {post.communityName || "Unknown Community"} * {formatTimestamp(post.timestamp)}
                </h2>
              </div>
            </div>
            {post.userId === currentUserId && (
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === post.id ? null : post.id)
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  &#x22EE; {/* Three-dot menu */}
                </button>
                {menuOpen === post.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                    <button
                      onClick={() =>
                        handleDeletePost(post.id, post.communityId)
                      }
                      className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <h3 className="text-lg font-bold">{post.content}</h3>
          {post.image && (
            <Image
              src={post.image} // No fallback for post image
              alt="Post Image"
              width={400}
              height={300}
              className="rounded mt-2"
            />
          )}

          {/* Recipe Link */}
          {post.recipeId && post.recipeTitle && (
            <div className="mt-4">
              <a
                href={`/main/recipes/${post.recipeId}`}
                className="text-blue-500 hover:underline text-sm"
              >
                Click to view "{post.recipeTitle}"
              </a>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Comments</h4>
            <div className="space-y-2">
              {comments[post.id]?.length > 4 && !expandedComments[post.id] ? (
                <>
                  {comments[post.id]
                    .slice(-2)
                    .map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2 bg-gray-100 rounded flex items-center justify-between"
                      >
                        <div className="flex items-start">
                          <Image
                            src={comment.userProfilePicture || "/images/default-profile.png"} // Fallback for commenter profile picture
                            alt="Commenter Profile"
                            width={30}
                            height={30}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <div>
                            <p className="text-sm font-semibold">{comment.userName}</p>
                            <p className="text-sm">{comment.content}</p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(comment.timestamp)}
                            </p>
                          </div>
                        </div>
                        {comment.userId === currentUserId && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setCommentMenuOpen((prev) => ({
                                  ...prev,
                                  [comment.id]: !prev[comment.id],
                                }))
                              }
                              className="text-gray-500 hover:text-gray-700"
                            >
                              &#x22EE; {/* Three-dot menu */}
                            </button>
                            {commentMenuOpen[comment.id] && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                                <button
                                  onClick={() =>
                                    handleDeleteComment(post.id, comment.id)
                                  }
                                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                                >
                                  Delete Comment
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View all comments ({comments[post.id].length})
                  </button>
                </>
              ) : (
                <>
                  {comments[post.id]?.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2 bg-gray-100 rounded flex items-center justify-between"
                    >
                      <div className="flex items-start">
                        <Image
                          src={comment.userProfilePicture || "/images/default-profile.png"} // Fallback for commenter profile picture
                          alt="Commenter Profile"
                          width={30}
                          height={30}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <div>
                          <p className="text-sm font-semibold">{comment.userName}</p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(comment.timestamp)}
                          </p>
                        </div>
                      </div>
                      {comment.userId === currentUserId && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setCommentMenuOpen((prev) => ({
                                ...prev,
                                [comment.id]: !prev[comment.id],
                              }))
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            &#x22EE; {/* Three-dot menu */}
                          </button>
                          {commentMenuOpen[comment.id] && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                              <button
                                onClick={() =>
                                  handleDeleteComment(post.id, comment.id)
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                              >
                                Delete Comment
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {comments[post.id]?.length > 4 && (
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Condense comments
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Add Comment Section */}
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => handleLike(post.id, post.communityId)}
                className="flex items-center space-x-2"
              >
                <FaUtensilSpoon
                  size={20}
                  className={`${
                    likedPosts[post.id] ? "text-red" : "text-gray"
                  }`}
                />
                <span className="text-sm text-gray-700">{post.likes}</span>
              </button>
              <input
                type="text"
                value={newComment[post.id] || ""}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                placeholder="Add a comment..."
                className="flex-grow p-2 border rounded text-black"
              />
              <Button
                onClick={() => handleAddComment(post.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
