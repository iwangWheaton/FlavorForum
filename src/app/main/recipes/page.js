"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { getRecipes } from "@/lib/recipeService";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();

        const formattedRecipes = data.map(recipe => ({
          ...recipe,
          image: recipe.image,
          averageRating: recipe.averageRating || "No ratings yet",
          cookingTime: recipe.cookingTime,
          difficulty: recipe.difficulty,
          dietaryOptions: recipe.dietaryOptions
        }));
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRecipes();
  }, []);

  const glutenFreeRecipes = recipes.filter((recipe) => recipe.dietaryOptions && recipe.dietaryOptions.includes("Gluten-Free"));
  const veganRecipes = recipes.filter((recipe) => recipe.dietaryOptions && recipe.dietaryOptions.includes("Vegan"));
  const quickRecipes = recipes.filter((recipe) => recipe.dietaryOptions && recipe.cookingTime < 30);

  return (
    <div className="p-4 md:p-8 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gluten-Free Favorites</h1>
        <Link href="/main/recipes/new">
          <button className="p-2 bg-red text-white rounded">Create Recipe</button>
        </Link>
      </div>
      {glutenFreeRecipes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {glutenFreeRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray">No recipes in this category.</p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 mt-10">All Recipes</h1>

      {recipes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray">No recipes yet. Create a new recipe!</p>
        </div>
      )}
      </div>
  );
}