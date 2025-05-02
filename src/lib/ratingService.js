
// ratingservice.js
import { db } from './firebase.js'; 
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";


export const HandleUserRating = async (rating, itemId, userId) =>{
  try {
    const {userId, itemtitle, ...ratingData} = rating;

    const docRef = await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      userId,
      itemtitle,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...rating };
  }
  catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
}

export const getRecipeRatings = async (itemtitle) => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(ratingsRef, where('itemtitle', '==', itemtitle));

  const snapshot = await getDocs(q);
  const ratings = snapshot.docs.map(doc => doc.data().rating);

  if (ratings.length === 0) return null;

  const average = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
  return average;
};
  