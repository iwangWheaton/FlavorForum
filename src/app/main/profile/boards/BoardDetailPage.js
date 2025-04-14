// src/app/main/profile/boards/BoardDetailPage.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import Button from "@/components/Button";
import { FaTrash, FaEdit, FaShare } from "react-icons/fa";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBoardRecipes, removeRecipeFromBoard } from "@/lib/recipeService";

export default function BoardDetailPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [board, setBoard] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const unwrappedParams = use(params);

  useEffect(() => {
    const fetchBoardAndRecipes = async () => {
      if (!unwrappedParams?.boardId || !session?.user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch board details
        const boardDoc = await getDoc(doc(db, "boards", unwrappedParams.boardId));
        
        if (!boardDoc.exists()) {
          setError("Board not found");
          setLoading(false);
          return;
        }
        
        const boardData = { id: boardDoc.id, ...boardDoc.data() };
        setBoard(boardData);
        
        // Check permission
        if (boardData.userId !== session.user.uid && boardData.isPrivate) {
          setError("You don't have permission to view this board");
          setLoading(false);
          return;
        }
        
        // Fetch recipes in this board
        const boardRecipes = await getBoardRecipes(unwrappedParams.boardId, session.user.uid);
        setRecipes(boardRecipes);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to load board");
      } finally {
        setLoading(false);
      }
    };

    fetchBoardAndRecipes();
  }, [unwrappedParams, session]);

  const handleRemoveRecipe = async (recipeId) => {
    try {
      await removeRecipeFromBoard(recipeId, board.id, session.user.uid);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error removing recipe:", err);
      alert("Failed to remove recipe: " + err.message);
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "boards", board.id));
      router.push("/main/profile/boards");
    } catch (err) {
      console.error("Error deleting board:", err);
      alert("Failed to delete board: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-gray">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-red mb-4">{error}</p>
        <Button onClick={() => router.push("/main/profile/boards")}>
          Back to Boards
        </Button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-red mb-4">Board not found</p>
        <Button onClick={() => router.push("/main/profile/boards")}>
          Back to Boards
        </Button>
      </div>
    );
  }

  const isOwner = session?.user?.uid === board.userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray">{board.name}</h1>
              {board.description && (
                <p className="text-gray/70 mt-1">{board.description}</p>
              )}
              <div className="flex items-center mt-2">
                <span className={`text-sm px-3 py-1 rounded-full ${board.isPrivate ? "bg-gray-200 text-gray" : "bg-blue bg-opacity-10 text-blue"}`}>
                  {board.isPrivate ? "Private" : "Public"}
                </span>
                <span className="text-sm text-gray/70 ml-4">
                  {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                </span>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/main/profile/boards/${board.id}/edit`)}
                  className="flex items-center gap-2 bg-blue hover:bg-blue/90"
                >
                  <FaEdit /> Edit
                </Button>
                <Button
                  onClick={() => {/* Share functionality */}}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                >
                  <FaShare /> Share
                </Button>
                <Button
                  onClick={handleDeleteBoard}
                  className="flex items-center gap-2 bg-red hover:bg-red/90"
                >
                  <FaTrash /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="relative h-48 w-full">
                    <Image 
                      src={recipe.recipeImage || "/images/background.avif"}
                      alt={recipe.recipeName || "Recipe image"}
                      fill
                      style={{objectFit: 'cover'}}
                    />
                  </div>
                  
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(recipe.id);
                      }}
                      className="absolute top-2 right-2 bg-red text-white p-2 rounded-full hover:bg-red/80"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/main/recipes/${recipe.id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray">{recipe.recipeName}</h3>
                  <div className="mt-2 flex justify-between text-sm text-gray">
                    {recipe.cookingTime && (
                      <div>
                        <span>{recipe.cookingTime} mins</span>
                      </div>
                    )}
                    {recipe.difficulty && (
                      <div>
                        <span>{recipe.difficulty}</span>
                      </div>
                    )}
                  </div>
                  
                  {recipe.dietaryOptions && recipe.dietaryOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {recipe.dietaryOptions.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue text-white text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Delete Confirmation */}
                {deleteConfirm === recipe.id && (
                  <div className="p-4 bg-red/10 border-t border-red/20">
                    <p className="text-sm text-red mb-2">Remove this recipe from the board?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(null);
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRecipe(recipe.id);
                        }}
                        className="px-3 py-1 text-sm bg-red text-white rounded hover:bg-red/90"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray mb-4">No recipes saved yet</h2>
            <p className="text-gray/70 mb-6">Start browsing recipes and save them to this board!</p>
            <Button
              onClick={() => router.push("/main/recipes")}
              className="bg-blue hover:bg-blue/90"
            >
              Browse Recipes
            </Button>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8">
          <Button 
            onClick={() => router.push("/main/profile/boards")} 
            className="bg-red hover:bg-red/90"
          >
            Back to Boards
          </Button>
        </div>
      </div>
    </div>
  );
}