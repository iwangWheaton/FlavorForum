
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
      <h1 className="text-2xl font-bold">View your Recipes</h1>
      
    </div>
  );
}
