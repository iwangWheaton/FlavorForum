"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserBoards } from "@/lib/boardService";
import { saveRecipeToBoard } from "@/lib/recipeService";
import Button from "@/components/Button";

export default function SaveToBoardModal({ isOpen, onClose, recipeId, recipeName }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBoards = async () => {
      setLoading(true);
      try {
        if (session?.user?.uid) {
          const userBoards = await getUserBoards(session.user.uid);
          setBoards(userBoards);
        }
      } catch (err) {
        setError("Failed to load your boards");
        console.error("Error fetching boards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [isOpen, session]);

  const handleSaveToBoard = async (boardId) => {
    setSaving(true);
    setError(null);
    
    try {
      if (!session?.user?.uid) {
        throw new Error("You must be logged in to save recipes");
      }
      
      await saveRecipeToBoard(recipeId, boardId, session.user.uid);
      setSaveSuccess(true);
      
      // Reset success message after 2 seconds and close modal
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to save recipe");
      console.error("Error saving recipe:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray mb-4">Save Recipe</h2>
        <p className="text-gray mb-4">Save &quot;{recipeName}&quot; to one of your boards:</p>
        
        {error && (
          <div className="bg-red bg-opacity-10 text-red p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
            Recipe saved successfully!
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">Loading your boards...</div>
        ) : boards.length > 0 ? (
          <div className="max-h-60 overflow-y-auto mb-4">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleSaveToBoard(board.id)}
                disabled={saving}
                className="w-full text-left p-3 border-b border-gray-200 hover:bg-gray-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray">{board.name}</p>
                  {board.description && (
                    <p className="text-sm text-gray-500">{board.description}</p>
                  )}
                </div>
                {board.isPrivate && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Private
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 mb-4">
            <p className="text-gray">You don&apos;t have any boards yet.</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button
            onClick={() => router.push("/main/profile/boards/new")}
            className="bg-blue hover:bg-blue/90"
          >
            Create New Board
          </Button>
          <Button onClick={onClose} className="bg-gray-300 text-gray hover:bg-gray-400">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}