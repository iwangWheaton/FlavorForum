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
    notes: "",
    cookingTime: 30,
    difficulty: "Medium",
    mealType: "Main Course",
    ingredients: "",
    instructions: "",
    dietaryOptions: []
  });

  const dietaryOptions = ["Gluten-Free", "Dairy-Free", "Vegan", "Vegetarian"];
  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const mealTypeOptions = ["Main Course", "Side Dish", "Lunch", "Dinner", "Dessert", "Other"];

  const handleChange = (e) => {
    setRecipe({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleDietaryToggle = (restriction) => {
    const newRestrictions = [...recipeData.dietaryOptions];
    if (newRestrictions.includes(restriction)) {
      const index = newRestrictions.indexOf(restriction);
      newRestrictions.splice(index, 1);
    } else {
      newRestrictions.push(restriction);
    }
    setRecipe({ ...recipeData, dietaryOptions: newRestrictions });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // placeholder image
      const recipeToSubmit = {
        ...recipeData,
        image: "/images/background.avif",
      };

      const userId = session?.user?.email || 'anonymous';
      await addRecipe(recipeData, userId);
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save recipe");
    }
  };

  return (
    <div className="p-8 bg-background">
      {!isSubmitted ? (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray">Create Your Recipe</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* title */}
            <div>
              <label htmlFor="title" className="block text-gray">Recipe Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={recipeData.title}
                onChange={handleChange}
                placeholder="Phoebe's Coconut-Milk Tomato Pasta"
                required
                className="w-full p-2 border border-gray/20 rounded-lg text-gray"
              />
            </div>
            
            {/* cooking time, difficulty, type */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cookingTime" className="block text-gray">Cooking Time (minutes)</label>
                <input
                  type="number"
                  id="cookingTime"
                  name="cookingTime"
                  value={recipeData.cookingTime}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full p-2 border border-gray/20 rounded-lg text-gray"
                />
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-gray">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={recipeData.difficulty}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray/20 rounded-lg text-gray"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="mealType" className="block text-gray">Meal Type</label>
                <select
                  id="mealType"
                  name="mealType"
                  value={recipeData.mealType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray/20 rounded-lg text-gray"
                >
                  {mealTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* dietary options */}
            <div>
              <label className="block text-gray mb-2">Dietary Friendly Tags</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleDietaryToggle(option)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      recipeData.dietaryOptions.includes(option)
                        ? "bg-blue text-white"
                        : "bg-gray/10 text-gray"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Ingredients, instructions, notes */}
            <div>
              <label htmlFor="ingredients" className="block text-gray mb-1">Ingredients</label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={recipeData.ingredients}
                onChange={handleChange}
                placeholder="- 2 tablespoons buttery butterific butter"
                required
                rows="5"
                className="w-full p-2 border border-gray/20 rounded-lg text-gray"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="instructions" className="block text-gray mb-1">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={recipeData.instructions}
                onChange={handleChange}
                placeholder="How do you make this recipe?"
                required
                rows="5"
                className="w-full p-2 border border-gray/20 rounded-lg text-gray"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-gray mb-1">Notes (optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={recipeData.notes}
                onChange={handleChange}
                placeholder="This will be the content of your post"
                rows="3"
                className="w-full p-2 border border-gray/20 rounded-lg text-gray"
              ></textarea>
            </div>
            
            {/* submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-red text-white rounded-lg hover:opacity-90 transition"
              >
                Save Recipe
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray mb-4">Recipe Submitted!</h2>
          <p className="mb-6 text-gray/80">Your recipe &quot;{recipeData.title}&quot; has been successfully created.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push("/main/recipes")}
              className="px-4 py-2 bg-blue text-white rounded-lg hover:opacity-90"
            >
              View All Recipes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}