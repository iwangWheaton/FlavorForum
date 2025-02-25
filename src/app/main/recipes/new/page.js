"use client";
import { useState } from "react";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = () => {
    console.log("Recipe Submitted:", { title, ingredients, instructions });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Create a Recipe</h1>
      <input type="text" placeholder="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mt-2" />
      <textarea placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)}
        className="border p-2 w-full mt-2"></textarea>
      <textarea placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)}
        className="border p-2 w-full mt-2"></textarea>
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 mt-4">Submit Recipe</button>
    </div>
  );
}
