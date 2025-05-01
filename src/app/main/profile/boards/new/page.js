// src/app/main/profile/boards/new/page.js
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createBoard } from "@/lib/boardService";
import Button from "@/components/Button";

export default function CreateBoard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [boardData, setBoard] = useState({
    name: "",
    description: "",
    isPrivate: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBoard({ 
      ...boardData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get user ID directly from the session
      const userId = session?.user?.uid;
      
      if (!userId) {
        throw new Error("User ID not found in session");
      }
      
      // Include userId directly in the board data
      const boardWithUserId = {
        ...boardData,
        userId: userId
      };
      
      // Pass the complete object to createBoard
      await createBoard(boardWithUserId, userId);
      router.push("/main/profile/boards");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create board: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray">Create a New Board</h1>
        
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
              onClick={() => router.push("/main/profile/boards")}
              className="mr-2 hover:bg-red/70"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="mr-2 hover:bg-red/70"
            >
              Create Board
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}