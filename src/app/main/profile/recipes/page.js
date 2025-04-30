"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
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
          where("userId", "==", session.user.uid), // Filter recipes by userId
          // orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(recipesQuery);

        if (querySnapshot.empty) {
          console.warn("No recipes found for the user.");
        } else {
          console.log("Fetched recipes:", querySnapshot.docs.map((doc) => doc.data())); // Debugging log
        }

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
      <ul className="space-y-4">
        {recipes.map((recipe) => (
          <li
            key={recipe.id}
            className="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/main/recipes/${recipe.id}`)} // Redirect to recipe page
          >
            {recipe.imageUrl && (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                width={400}
                height={300}
                className="rounded mb-4"
              />
            )}
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-500">
              Created on:{" "}
              {recipe.createdAt
                ? recipe.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
