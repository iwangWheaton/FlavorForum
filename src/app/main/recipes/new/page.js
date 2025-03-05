"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addRecipe } from "@/lib/recipeService";

export default function CreateRecipe() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitted, setSubmitted] = useState(false);
  const [recipeData, setRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: ""
  });

  const handleChange = (e) => {
    setRecipe({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = session?.user?.email || 'anonymous';
      await addRecipe(recipeData, userId);
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save recipe");
    }
  };

  return (
    <div className="p-8">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Create Recipe</h2>
          
          <input
            type="text"
            name="title"
            value={recipeData.title}
            onChange={handleChange}
            placeholder="Recipe Title"
            required
            className="w-full p-2 border mb-4 text-black"
          />
          
          <textarea
            name="ingredients"
            value={recipeData.ingredients}
            onChange={handleChange}
            placeholder="Ingredients"
            required
            className="w-full p-2 border mb-4 text-black"
            rows="3"
          ></textarea>
          
          <textarea
            name="instructions"
            value={recipeData.instructions}
            onChange={handleChange}
            placeholder="Instructions"
            required
            className="w-full p-2 border mb-4 text-black"
            rows="5"
          ></textarea>
          
          <button
            type="submit"
            className="w-full p-2 bg-blue text-white"
          >
            Submit Recipe
          </button>
        </form>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Recipe Submitted!</h2>
          <button 
            onClick={() => router.push("/main/recipes")}
            className="mt-4 p-2 bg-red text-white"
          >
            View Recipes
          </button>
        </div>
      )}
    </div>
  );
}