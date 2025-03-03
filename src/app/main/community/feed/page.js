"use client";
import { useState } from "react";

export default function CommunityFeed() {
  const [recipes, setRecipes] = useState([]);
  const [sort, setSort] = useState("hot");

  // Sample recipes
  const sampleRecipes = [
    { id: "101", title: "Avocado Toast", description: "A healthy start to your day.", community: "Healthy Eats" },
    { id: "102", title: "Spicy Chicken Wings", description: "Extra hot and delicious!", community: "Spicy Lovers" },
    { id: "103", title: "Chocolate Cake", description: "A rich and moist dessert.", community: "Baking Masters" },
  ];
//   useEffect(() => {
//     fetch(`/api/community/feed?sort=${sort}`)
//       .then((res) => res.json())
//       .then((data) => setRecipes(data));
//   }, [sort]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Community Feed</h1>

      <select value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded mt-2 ">
        <option value="hot">Hot</option>
        <option value="new">Newest</option>
        <option value="popular">Most Popular</option>
      </select>

      <ul className="mt-4">
        {sampleRecipes.map((recipe) => (
          <h1 key={recipe.id} className="p-4 border rounded mb-2">
            <h2 className="text-lg font-semibold">{recipe.title}</h2>
            <h2 className="text-gray-600">{recipe.community}</h2>
            <h2>{recipe.description}</h2>
          </h1>
        ))}
      </ul>
    </div>
  );
}
