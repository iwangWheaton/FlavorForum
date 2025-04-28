"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function UserRecipesPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (!session?.user?.uid) return;

      setLoading(true);
      try {
        const recipesRef = collection(db, "users", session.user.uid, "recipes");
        const recipesQuery = query(recipesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(recipesQuery);

        const userRecipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
    return <p className="text-center text-gray-500">You haven't created any recipes yet.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl  mb-6 text-black">Your Recipes</h1>
      <ul className="space-y-4">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-500">
              Created on: {recipe.timestamp?.toDate().toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
