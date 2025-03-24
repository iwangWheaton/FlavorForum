// src/lib/recipeService.js
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// add a recipe
export const addRecipe = async (recipe, userId) => {
  try {
    // extract the image file before saving to Firestore
    const { image, ...recipeData } = recipe;

    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipeData,
      userId,
      createdAt: new Date()
    });
    return { id: docRef.id, ...recipe };
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

// get all recipes
export const getRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() });
    });
    return recipes;
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};