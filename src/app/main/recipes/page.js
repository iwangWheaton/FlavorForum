"use client"
import { useState } from "react";
export default function BrowseRecipes() {
  const [isSubmitted, setSubmitted] = useState(false);
  const [recipeData, setRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: "",
  });

  const handleChange = (e) => {
    setRecipe({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {!isSubmitted 
      ? (<form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white shadow-lg p-6 rounded-lg w-full max-w-md">
          <h2 className="text-2xl text-black font-bold">Write your recipe</h2>
          
          <input
            type="text"
            name="title"
            value={recipeData.title}
            onChange={handleChange}
            placeholder="Recipe Title"
            required
            className="p-2 border rounded text-black"
          />
          
          <textarea
            name="ingredients"
            value={recipeData.ingredients}
            onChange={handleChange}
            placeholder="Ingredients"
            required
            rows="3"
            className="p-2 border rounded text-black"
          ></textarea>
          
          <textarea
            name="instructions"
            value={recipeData.instructions}
            onChange={handleChange}
            placeholder="Instructions"
            required
            rows="5"
            className="p-2 border rounded text-black"
          ></textarea>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">
            Thanks for submitting{" "}
            <span className="text-blue-500">{recipeData.title}</span>!
          </h2>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            See Your Recipe
          </button>
        </div>
      )}
    </div>
  );
  }