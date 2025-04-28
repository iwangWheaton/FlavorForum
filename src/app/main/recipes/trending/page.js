"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import Image from "next/image";

export default function TrendingRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingRecipes = async () => {
      setLoading(true);
      try {
        const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const recipesRef = collection(db, "recipes");
        const trendingQuery = query(
          recipesRef,
          where("timestamp", ">=", oneWeekAgo), // Filter recipes from the past week
          orderBy("likes", "desc"), // Order by likes in descending order
          limit(10) // Limit to top 10 recipes
        );
        const querySnapshot = await getDocs(trendingQuery);
        const trendingRecipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched recipes:", trendingRecipes); // Debugging log
        setRecipes(trendingRecipes);
      } catch (error) {
        console.error("Error fetching trending recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRecipes();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading trending recipes...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Trending Recipes This Week</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-md p-4">
            {recipe.image && (
              <Image
                src={recipe.image}
                alt={recipe.title}
                width={400}
                height={300}
                className="rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-600">{recipe.description}</p>
            <p className="text-gray-500 mt-2">Likes: {recipe.likes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
