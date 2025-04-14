// src/lib/recipeService.js
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';

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

// get recipe by id
export const getRecipeById = async (recipeId) => {
  try {
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    if (recipeDoc.exists()) {
      return { id: recipeDoc.id, ...recipeDoc.data() };
    } else {
      throw new Error('Recipe not found');
    }
  } catch (error) {
    console.error('Error getting recipe:', error);
    throw error;
  }
};

// save recipe to board
export const saveRecipeToBoard = async (recipeId, boardId, userId) => {
  try {
    // Check if recipe exists
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }
    
    // Check if board exists and belongs to user
    const boardDoc = await getDoc(doc(db, 'boards', boardId));
    if (!boardDoc.exists()) {
      throw new Error('Board not found');
    }
    
    if (boardDoc.data().userId !== userId) {
      throw new Error('You do not have permission to save to this board');
    }
    
    // Check if recipe is already saved to this board
    const savedRecipeRef = doc(db, 'boards', boardId, 'savedRecipes', recipeId);
    const savedRecipeDoc = await getDoc(savedRecipeRef);
    
    if (savedRecipeDoc.exists()) {
      throw new Error('Recipe is already saved to this board');
    }
    
    // Save recipe reference to board
    await setDoc(savedRecipeRef, {
      recipeId,
      savedAt: serverTimestamp(),
      recipeName: recipeDoc.data().title,
      recipeImage: recipeDoc.data().imageUrl || null,
      cookingTime: recipeDoc.data().cookingTime || null,
      difficulty: recipeDoc.data().difficulty || null,
      dietaryOptions: recipeDoc.data().dietaryOptions || [],
    });
    
    // Update the board's recipe count
    await setDoc(
      doc(db, 'boards', boardId),
      { 
        recipeCount: (boardDoc.data().recipeCount || 0) + 1,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    
    return true;
  } catch (error) {
    console.error('Error saving recipe to board:', error);
    throw error;
  }
};

// get saved recipes for a board
export const getBoardRecipes = async (boardId, userId) => {
  try {
    // Check if board exists and belongs to user
    const boardDoc = await getDoc(doc(db, 'boards', boardId));
    if (!boardDoc.exists()) {
      throw new Error('Board not found');
    }
    
    if (boardDoc.data().userId !== userId && boardDoc.data().isPrivate) {
      throw new Error('You do not have permission to view this board');
    }
    
    const recipesSnapshot = await getDocs(collection(db, 'boards', boardId, 'savedRecipes'));
    const savedRecipes = [];
    
    for (const doc of recipesSnapshot.docs) {
      const savedRecipeData = doc.data();
      savedRecipes.push({
        id: doc.id,
        ...savedRecipeData
      });
    }
    
    return savedRecipes;
  } catch (error) {
    console.error('Error getting board recipes:', error);
    throw error;
  }
};

// remove recipe from board
export const removeRecipeFromBoard = async (recipeId, boardId, userId) => {
  try {
    // Check if board exists and belongs to user
    const boardDoc = await getDoc(doc(db, 'boards', boardId));
    if (!boardDoc.exists()) {
      throw new Error('Board not found');
    }
    
    if (boardDoc.data().userId !== userId) {
      throw new Error('You do not have permission to modify this board');
    }
    
    // Remove recipe from board
    await deleteDoc(doc(db, 'boards', boardId, 'savedRecipes', recipeId));
    
    // Update the board's recipe count
    await setDoc(
      doc(db, 'boards', boardId),
      { 
        recipeCount: Math.max((boardDoc.data().recipeCount || 0) - 1, 0),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    
    return true;
  } catch (error) {
    console.error('Error removing recipe from board:', error);
    throw error;
  }
};