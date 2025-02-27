// src/components/CategorySection.js
"use client";

import Link from 'next/link';
import RecipeCard from './RecipeCard';

const CategorySection = ({ category, recipes }) => {
  return (
    <section className="my-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray">{category.name}</h2>
          <p className="text-gray">{category.description}</p>
        </div>
        <Link 
          href={`/categories/${category.id}`}
          className="text-blue-500 hover:text-blue-700"
        >
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;