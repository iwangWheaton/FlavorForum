import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function getUserId(user) {
  const uid = user.uid || user;
  try {
    // Check for existing user document by UID
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // return existing user ID
      return userDoc.data().userId;
    } else {
      // Create new user with generated ID
      await setDoc(userRef, {
        email: typeof user === 'object' ? user.email : null,
        userId: uid,
        createdAt: new Date()
      });
      return uid;
    }
  } catch (error) {
    console.error('Error getting/creating user ID:', error);
    throw error;
  }
}