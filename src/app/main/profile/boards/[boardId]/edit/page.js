"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "@/components/Button";

export default function EditBoardPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [boardData, setBoard] = useState({
    name: "",
    description: "",
    isPrivate: false
  });

  useEffect(() => {
    if (!params?.boardId || !session?.user?.uid) {
      router.push("/main/profile/boards");
      return;
    }

    const fetchBoard = async () => {
      try {
        const boardRef = doc(db, "boards", params.boardId);
        const boardSnap = await getDoc(boardRef);
        
        if (!boardSnap.exists()) {
          setError("Board not found");
          return;
        }
        
        const board = boardSnap.data();
        
        // Check if user owns this board
        if (board.userId !== session.user.uid) {
          setError("You don't have permission to edit this board");
          return;
        }
        
        setBoard({
          name: board.name || "",
          description: board.description || "",
          isPrivate: board.isPrivate || false
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load board");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [params, session, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBoard({ 
      ...boardData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const boardRef = doc(db, "boards", params.boardId);
      
      await updateDoc(boardRef, {
        ...boardData,
        updatedAt: serverTimestamp()
      });
      
      router.push(`/main/profile/boards/${params.boardId}`);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to update board");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-gray">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <p className="text-2xl text-red mb-4">{error}</p>
        <Button onClick={() => router.push("/main/profile/boards")}>
          Back to Boards
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray">Edit Board</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray mb-2">Board Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={boardData.name}
              onChange={handleChange}
              placeholder="Weeknight Dinners"
              required
              className="w-full p-2 border border-gray/20 rounded-lg text-gray"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray mb-2">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={boardData.description}
              onChange={handleChange}
              placeholder="Easy dinners for busy days."
              rows="3"
              className="w-full p-2 border border-gray/20 rounded-lg text-gray"
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={boardData.isPrivate}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isPrivate" className="text-gray">Make this board private</label>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => router.push(`/main/profile/boards/${params.boardId}`)}
              className="mr-2 bg-gray-300 text-gray hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue hover:bg-blue/90"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}