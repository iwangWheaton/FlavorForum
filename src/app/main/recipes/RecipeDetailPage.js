// src/app/main/recipes/RecipeDetailPage.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import StarComp from "@/app/main/reviews/StarRating/starComp";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Button from "@/components/Button";

export default function RecipeDetailPage({ params }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unwrappedParams = use(params);

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
              <h1 className="text-4xl font-bold text-white">{recipe.title}</h1>
              <div className="flex items-center mt-2">
                <StarComp />
              </div>
            </div>
          </div>
        </div>

        {/* Recipe details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6">
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

        {/* Back button */}
        <div className="mt-8">
          <Button 
            onClick={() => router.push("/main/recipes")} 
            className="bg-red hover:bg-red/90"
          >
            Back to Recipes
          </Button>
        </div>
      </div>
    </div>
  );
}