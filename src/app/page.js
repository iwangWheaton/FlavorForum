"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import CategorySection from "@/components/CategorySection";

const category = {
  "id": "quick-meals",
  "name": "Quick Meals",
  "image": "/images/categories/quick-meals.jpg",
  "description": "Ready in 30 minutes or less"
};

const recipes = [
  {
    "id": "1",
    "title": "Classic Spaghetti Carbonara",
    "image": "/images/carbonara.jpg",
    "cookingTime": 30,
    "difficulty": "Medium",
    "servingSize": 4,
    "categories": ["main-course", "pasta", "quick-meals"],
    "cuisineType": "Italian",
    "dietaryRestrictions": [],
    "averageRating": 4.7,
    "reviewCount": 42
  },
  {
    "id": "2",
    "title": "Vegetarian Buddha Bowl",
    "image": "/images/buddha-bowl.jpg",
    "cookingTime": 25,
    "difficulty": "Easy",
    "servingSize": 2,
    "categories": ["main-course", "healthy", "vegetarian", "quick-meals"],
    "cuisineType": "Fusion",
    "dietaryRestrictions": ["Vegetarian", "Gluten-Free"],
    "averageRating": 4.5,
    "reviewCount": 28
  },
  {
    "id": "3",
    "title": "Quick Chocolate Brownies",
    "image": "/images/brownies.jpg",
    "cookingTime": 35,
    "difficulty": "Easy",
    "servingSize": 12,
    "categories": ["dessert", "quick-meals"],
    "cuisineType": "American",
    "dietaryRestrictions": ["Vegetarian"],
    "averageRating": 4.9,
    "reviewCount": 65
  }
];

//this is the homepage 
export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-6 bg-white">
      <div className="w-full max-w-6xl text-center my-8">
        <h1 className="text-5xl font-bold text-black">Welcome to Flavor Forum</h1>
        <p className="text-gray mt-4 text-lg">
          Find, organize, and share amazing recipes with your community.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          
          <Button onClick={() => router.push("/login")} className="!bg-blue">
            Login
          </Button>
          <Button onClick={() => router.push("/signup")} className="!bg-blue">
            Sign Up
          </Button>
        </div>
      </div>

      {/* Quick Meals Section */}
      <div className="w-full max-w-6xl">
        <CategorySection 
          category={category} 
          recipes={recipes} 
        />
      </div>

    </div> 
  );
}