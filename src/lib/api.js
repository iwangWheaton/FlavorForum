export function fetchRecipes() {
    return fetch("/api/recipes").then((res) => res.json());
  }