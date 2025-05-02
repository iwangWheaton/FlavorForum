
// ratingservice.js



import { db } from './firebase.js'; 
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';


export const handleUserRating = async (rating, itemId, userId) =>{
  try {
    const {userId, itemId, ...ratingData} = rating;

    const docRef = await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      userId,
      itemId,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...rating };
  }
  catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
}
  