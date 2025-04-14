"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addRecipe } from "@/lib/recipeService";
import { uploadRecipeImage } from "@/lib/uploadService";
import { getUserId } from "@/lib/userService";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";

export default function CreateRecipe() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null); 

  const [recipeData, setRecipe] = useState({
    title: "",
    notes: "",
    cookingTime: 30,
    difficulty: "Medium",
    mealType: "Main Course", 
    ingredients: "",
    instructions: "",
    dietaryOptions: [],
    image: null,
    imageUrl: "/images/background.avif"
  });

  const dietaryOptions = ["Gluten-Free", "Dairy-Free", "Vegan", "Vegetarian"];
  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const mealTypeOptions = ["Main Course", "Side Dish", "Lunch", "Dinner", "Dessert", "Other"];

  const handleChange = (e) => {
    setRecipe({ ...recipeData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if(file) {
      if(!file.type.match('image.*')) {
        alert("Please upload an image file");
        return;
      }

      if(file.size > 1024 * 1024 * 5) {
        alert("Image size must be less than 5MB");
        return;
      }

      setRecipe({...recipeData, image: file});

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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

    console.log("Session data:", session);
    
    try {
      let userId = 'anonymous';
      if(session?.user?.email) {
        userId = await getUserId(session.user.email);
      }

      let imageUrl = recipeData.imageUrl;
      
      //  image
      if(recipeData.image) {
        setUploadProgress(0);

        // generate a temporary ID for the recipe folder
        const tempRecipeId = `${userId}-${Date.now()}`;
        imageUrl = await uploadRecipeImage(
          recipeData.image,
          userId,
          tempRecipeId,
          (progress) => setUploadProgress(progress)
        );
      }

      const recipeToSubmit = {
        ...recipeData,
        imageUrl: imageUrl,
      };

      await addRecipe(recipeToSubmit, session.user.uid);
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
            {/* image upload */}
            <div>
              <label className="block text-gray mb-2">Recipe Image</label>
              <div className="flex flex-col items-center">
                {previewImage ? (
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src = {previewImage}
                      alt = "recipe preview"
                      fill
                      className = "rounded-lg object-cover"
                      />
                </div>
                ) : (
                  <div className = "w-full h-64 bg-gray/10 rounded-lg flex items-center justify-center mb-4">
                    <p className = "text-gray/50">No image selected</p>    
                  </div>
                  )}
                
                <div className = "flex gap-4">
                  <button
                    type = "button"
                    onClick = {() => fileInputRef.current.click()}
                    className = "px-4 py-2 bg-blue text-white rounded-lg hover:opacity-90"
                    >
                      {previewImage ? "Change Image" : "Select Image"}
                    </button>

                    {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setRecipe({ ...recipeData, image: null });
                      }}
                      className="px-4 py-2 bg-red text-white rounded-lg hover:opacity-90"
                    >
                      Remove Image
                    </button>
                    )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full mt-4">
                    <div className="h-2 bg-gray/20 rounded-full">
                      <div 
                        className="h-full bg-blue rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray/70 mt-1">
                      Uploading: {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
                </div>
            </div>

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