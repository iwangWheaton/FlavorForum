"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecipes } from "@/lib/recipeService";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Link href="/main/recipes/new">
          <button className="p-2 bg-blue text-white">Create Recipe</button>
        </Link>
      </div>

      {recipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{recipe.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(recipe.createdAt?.toDate()).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <h3 className="font-bold">Ingredients:</h3>
                <p className="whitespace-pre-line">{recipe.ingredients}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No recipes yet. Create your first recipe!</p>
      )}
    </div>
  );
}