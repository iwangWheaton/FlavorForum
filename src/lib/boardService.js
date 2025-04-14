import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// create a new board
export const createBoard = async (board, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'boards'), {
      ...board,
      userId,
      recipeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
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

// get a single board by ID
export const getBoardById = async (boardId, userId) => {
  try {
    const docRef = doc(db, 'boards', boardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Board not found');
    }
    
    const boardData = docSnap.data();
    
    // Check if user has permission to view this board
    if (boardData.isPrivate && boardData.userId !== userId) {
      throw new Error('You do not have permission to view this board');
    }
    
    return { id: docSnap.id, ...boardData };
  } catch (error) {
    console.error('Error fetching board:', error);
    throw error;
  }
};

// update a board
export const updateBoard = async (boardId, boardData, userId) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    const boardSnap = await getDoc(boardRef);
    
    if (!boardSnap.exists()) {
      throw new Error('Board not found');
    }
    
    if (boardSnap.data().userId !== userId) {
      throw new Error('You do not have permission to update this board');
    }
    
    await updateDoc(boardRef, {
      ...boardData,
      updatedAt: serverTimestamp()
    });
    
    return { id: boardId, ...boardData };
  } catch (error) {
    console.error('Error updating board:', error);
    throw error;
  }
};

// delete a board
export const deleteBoard = async (boardId, userId) => {
  try {
    const boardRef = doc(db, 'boards', boardId);
    const boardSnap = await getDoc(boardRef);
    
    if (!boardSnap.exists()) {
      throw new Error('Board not found');
    }
    
    if (boardSnap.data().userId !== userId) {
      throw new Error('You do not have permission to delete this board');
    }
    
    // Delete the board
    await deleteDoc(boardRef);
    
    // Delete all saved recipes in the board
    const savedRecipesRef = collection(db, 'boards', boardId, 'savedRecipes');
    const savedRecipesSnap = await getDocs(savedRecipesRef);
    
    const deletePromises = [];
    savedRecipesSnap.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error;
  }
};