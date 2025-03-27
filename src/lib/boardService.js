import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// create a new board
export const createBoard = async (board, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'boards'), {
      ...board,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...board };
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

// get all boards for a user
export const getUserBoards = async (userId) => {
  try {
    const q = query(collection(db, 'boards'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const boards = [];
    querySnapshot.forEach((doc) => {
      boards.push({ id: doc.id, ...doc.data() });
    });
    
    return boards;
  } catch (error) {
    console.error('Error fetching user boards:', error);
    throw error;
  }
};