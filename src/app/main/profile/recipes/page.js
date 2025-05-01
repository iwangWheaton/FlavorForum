"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";

export default function UserRecipesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!session?.user?.uid) {
        console.error("User is not logged in or session is missing.");
        return;
      }

      setLoading(true);
      try {
        const recipesRef = collection(db, "recipes");
        const recipesQuery = query(
          recipesRef,
          where("userId", "==", session.user.uid) // Filter recipes by userId
        );
        const querySnapshot = await getDocs(recipesQuery);

        const userRecipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null, // Ensure createdAt is converted to a Date object
        }));

        setRecipes(userRecipes);
      } catch (error) {
        console.error("Error fetching user recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, [session]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading your recipes...</p>;
  }

  if (!recipes.length) {
    return <p className="text-center text-black">You haven't created any recipes yet.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl mb-6 text-black">Your Recipes</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="relative h-48 w-full">
                <Image 
                  src={recipe.imageUrl || "/images/background.avif"}
                  alt={recipe.title || "Recipe image"}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            
            <div 
              className="p-4 cursor-pointer"
              onClick={() => router.push(`/main/recipes/${recipe.id}`)}
            >
              <h3 className="text-lg font-semibold text-gray">{recipe.title}</h3>
              <div className="mt-2 flex justify-between text-sm text-gray">
                {recipe.cookingTime && (
                  <div>
                    <span>{recipe.cookingTime} mins</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div>
                    <span>{recipe.difficulty}</span>
                  </div>
                )}
              </div>
              
              {recipe.dietaryOptions && recipe.dietaryOptions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.dietaryOptions.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-blue text-white text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
