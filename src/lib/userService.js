import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function getUserId(email) {
  try {
    // try to get existing user document
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // return existing user ID
      return userDoc.data().userId;
    } else {
      // create new user with generated ID
      const newUserId = uuidv4();
      await setDoc(userRef, {
        email,
        userId: newUserId,
        createdAt: new Date()
      });
      return newUserId;
    }
  } catch (error) {
    console.error('Error getting/creating user ID:', error);
    throw error;
  }
}