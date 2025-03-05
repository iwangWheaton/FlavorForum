"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { getRecipes } from "@/lib/recipeService";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();

        const formattedRecipes = data.map(recipe => ({
          ...recipe,
          image: recipe.image || "/images/background.avif",
          averageRating: recipe.averageRating || "No ratings yet",
          cookingTime: recipe.cookingTime || "30",
          difficulty: recipe.difficulty || "Medium",
          dietaryRestrictions: recipe.dietaryRestrictions || []
        }));
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Link href="/main/recipes/new">
          <button className="p-2 bg-red text-white rounded">Create Recipe</button>
        </Link>
      </div>

      {recipes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray">No recipes yet. Create your first recipe!</p>
        </div>
      )}
    </div>
  );
}