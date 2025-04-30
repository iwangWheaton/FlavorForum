"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import StarComp from "@/app/main/reviews/StarRating/starComp";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import Button from "@/components/Button";
import SaveToBoardModal from "@/components/SaveToBoardModal";
import { useSession } from "next-auth/react";
import { FaRegBookmark, FaEllipsisV } from "react-icons/fa";

export default function RecipeDetailPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unwrappedParams = use(params);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!unwrappedParams?.recipeId) {
        setError("Recipe not found");
        setLoading(false);
        return;
      }

      try {
        const recipeDoc = await getDoc(doc(db, "recipes", unwrappedParams.recipeId));
        
        if (recipeDoc.exists()) {
          setRecipe({ id: recipeDoc.id, ...recipeDoc.data() });
        } else {
          setError("Recipe not found");
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [unwrappedParams]);

  const handleSaveClick = () => {
    if (!session) {
      router.push(`/login?redirect=/main/recipes/${unwrappedParams.recipeId}`);
      return;
    }
    setIsSaveModalOpen(true);
  };

  const loadDisqus = () => {
    if (typeof window !== "undefined") {
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.url = `${window.location.origin}/main/recipes/${unwrappedParams.recipeId}`;
            this.page.identifier = unwrappedParams.recipeId;
            this.page.title = recipe?.title || "Recipe";
          },
        });
      } else {
        window.disqus_config = function () {
          this.page.url = `${window.location.origin}/main/recipes/${unwrappedParams.recipeId}`;
          this.page.identifier = unwrappedParams.recipeId;
          this.page.title = recipe?.title || "Recipe";
        };

        const d = document;
        const s = d.createElement("script");
        s.src = "https://flavorforum.disqus.com/embed.js"; // Replace with your Disqus shortname
        s.setAttribute("data-timestamp", +new Date());
        (d.head || d.body).appendChild(s);
      }
    }
  };

  useEffect(() => {
    if (recipe) {
      loadDisqus();
    }
  }, [recipe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-gray">Loading recipe...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-red mb-4">{error || "Recipe not found"}</p>
        <Button onClick={() => router.push("/main/recipes")}>
          Back to Recipes
        </Button>
      </div>
    );
  }

  // Format ingredients as list items
  const ingredientsList = recipe.ingredients
    ? recipe.ingredients.split('\n').filter(line => line.trim() !== '')
    : [];

  // Format instructions as numbered steps
  const instructionsList = recipe.instructions
    ? recipe.instructions.split('\n').filter(line => line.trim() !== '')
    : [];

  const handleDeleteRecipe = async () => {
    if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete the recipe from the database
      await deleteDoc(doc(db, "recipes", unwrappedParams.recipeId));
      alert("Recipe deleted successfully.");
      router.push("/main/recipes"); // Redirect to the recipes page
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete the recipe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hero section with image */}
        <div className="relative w-full h-80 mb-6">
          <Image
            src={recipe.imageUrl || "/images/background.avif"}
            alt={recipe.title}
            fill
            className="rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-gray bg-opacity-30 flex items-end">
            <div className="p-6 w-full">
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">{recipe.title}</h1>
                <Button
                  onClick={handleSaveClick}
                  className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white rounded-full p-3"
                >
                  <FaRegBookmark size={20} />
                </Button>
              </div>
              <div className="flex items-center mt-2">
                <StarComp />
              </div>
            </div>
          </div>
        </div>

        {/* Recipe details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue bg-opacity-10 px-4 py-2 rounded-lg">
                <span className="text-blue font-semibold">Time:</span>
                <span className="ml-2 text-gray">{recipe.cookingTime || "-"} mins</span>
              </div>
              
              <div className="bg-blue bg-opacity-10 px-4 py-2 rounded-lg">
                <span className="text-blue font-semibold">Difficulty:</span>
                <span className="ml-2 text-gray">{recipe.difficulty || "Medium"}</span>
              </div>
              
              <div className="bg-blue bg-opacity-10 px-4 py-2 rounded-lg">
                <span className="text-blue font-semibold">Meal Type:</span>
                <span className="ml-2 text-gray">{recipe.mealType || "Main Course"}</span>
              </div>
            </div>

            {/* Three-dot menu */}
            {recipe.userId === session?.user?.uid && (
              <div className="relative">
                <Button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="text-black hover:text-black"
                >
                  <FaEllipsisV size={20} />
                </Button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-40 z-50">
                    <Button
                      onClick={handleDeleteRecipe}
                      className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete Recipe
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dietary tags */}
          {recipe.dietaryOptions && recipe.dietaryOptions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray mb-2">Dietary Options:</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryOptions.map((option, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue text-white rounded-full text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray mb-2">Notes:</h2>
              <p className="text-gray bg-background p-4 rounded-lg italic">{recipe.notes}</p>
            </div>
          )}
        </div>

        {/* Ingredients and Instructions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray mb-4">Ingredients</h2>
            {ingredientsList.length > 0 ? (
              <ul className="space-y-2">
                {ingredientsList.map((ingredient, index) => (
                  <li key={index} className="flex items-start text-gray">
                    <span className="mr-2">•</span>
                    <span>{ingredient.replace(/^-\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray">No ingredients listed</p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray mb-4">Instructions</h2>
            {instructionsList.length > 0 ? (
              <ol className="space-y-4 list-decimal list-inside">
                {instructionsList.map((step, index) => (
                  <li key={index} className="text-gray">{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray">No instructions provided</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center relative">
          <Button
            onClick={() => router.push("/main/recipes")}
            className="bg-red hover:bg-red/90"
          >
            Back to Recipes
          </Button>

          <Button
            onClick={handleSaveClick}
            className="flex items-center gap-2 bg-blue hover:bg-blue/90"
          >
            <FaRegBookmark /> Save to Board
          </Button>
        </div>

        {/* Disqus Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div id="disqus_thread"></div>
        </div>
      </div>

      {/* Save to Board Modal */}
      <SaveToBoardModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        recipeId={unwrappedParams?.recipeId}
        recipeName={recipe?.title}
      />
    </div>
  );
}