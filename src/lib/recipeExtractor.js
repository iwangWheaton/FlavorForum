// src/lib/recipeExtractor.js
export async function extractRecipeFromURL(url, apiKey) {
    try {
      // Prepare the API URL with encoded parameters
      const encodedURL = encodeURIComponent(url);
      const apiURL = `https://api.spoonacular.com/recipes/extract?url=${encodedURL}&forceExtraction=true&analyze=false&includeNutrition=false&includeTaste=false&apiKey=${apiKey}`;
      
      // Fetch data from Spoonacular API
      const response = await fetch(apiURL);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract recipe');
      }
      
      // Parse the response
      const data = await response.json();
      
      // Map the Spoonacular response to our app's recipe format
      const recipe = {
        title: data.title || '',
        cookingTime: data.readyInMinutes || 30,
        difficulty: 'Medium', // Default value as Spoonacular doesn't provide this
        mealType: getMealTypeFromDishTypes(data.dishTypes),
        instructions: data.instructions || '',
        notes: data.summary ? stripHtmlTags(data.summary) : '',
        imageUrl: data.image || '',
        dietaryOptions: getDietaryOptionsFromDiets(data.diets),
        structuredIngredients: extractIngredientsFromResponse(data.extendedIngredients),
      };
      
      return recipe;
    } catch (error) {
      console.error('Error extracting recipe:', error);
      throw error;
    }
  }
  
  // Helper function to extract ingredients
  function extractIngredientsFromResponse(extendedIngredients) {
    if (!extendedIngredients || !Array.isArray(extendedIngredients)) {
      return [];
    }
    
    return extendedIngredients.map(ingredient => ({
      quantity: ingredient.measures?.us?.amount?.toString() || '',
      unit: ingredient.measures?.us?.unitShort || '',
      name: ingredient.name || '',
    }));
  }
  
  // Helper function to map dish types to meal types
  function getMealTypeFromDishTypes(dishTypes) {
    if (!dishTypes || !Array.isArray(dishTypes) || dishTypes.length === 0) {
      return 'Main Course';
    }
    
    // Map common dish types to our meal types
    const dishTypeMap = {
      'main course': 'Main Course',
      'main dish': 'Main Course',
      'dinner': 'Dinner',
      'lunch': 'Lunch',
      'dessert': 'Dessert',
      'side dish': 'Side Dish',
      'appetizer': 'Other',
      'breakfast': 'Other',
      'brunch': 'Other',
    };
    
    // Look for a match in our dish types
    for (const dishType of dishTypes) {
      const lowerCaseDishType = dishType.toLowerCase();
      if (dishTypeMap[lowerCaseDishType]) {
        return dishTypeMap[lowerCaseDishType];
      }
    }
    
    return 'Main Course';
  }
  
  // Helper function to map diets to dietary options
  function getDietaryOptionsFromDiets(diets) {
    if (!diets || !Array.isArray(diets) || diets.length === 0) {
      return [];
    }
    
    // Map Spoonacular diets to our dietary options
    const dietMap = {
      'gluten free': 'Gluten-Free',
      'dairy free': 'Dairy-Free',
      'vegan': 'Vegan',
      'vegetarian': 'Vegetarian',
    };
    
    return diets
      .map(diet => dietMap[diet.toLowerCase()])
      .filter(Boolean); // Remove nulls/undefined
  }
  
  // Helper function to strip HTML tags from text
  function stripHtmlTags(text) {
    if (!text) return '';
    return text.replace(/<\/?[^>]+(>|$)/g, '');
  }