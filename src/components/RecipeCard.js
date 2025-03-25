// src/components/RecipeCard.js
"use client";

import Image from 'next/image';
import Link from 'next/link';

const RecipeCard = ({ recipe }) => {
  const imageUrl = recipe.imageUrl || "/images/background.avif";
  
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 w-full">
          <Image 
            src={imageUrl}
            alt={recipe.title || "Recipe image"}
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg text-black">{recipe.title}</h3>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-sm text-black">{recipe.averageRating || "No ratings"}</span>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between text-sm text-gray">
            <div>
              <span>{recipe.cookingTime || "-"} mins</span>
            </div>
            <div>
              <span>{recipe.difficulty || "Medium"}</span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.dietaryOptions && recipe.dietaryOptions.length > 0 ? (
              recipe.dietaryOptions.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;