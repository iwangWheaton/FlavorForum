// src/app/main/profile/boards/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserBoards } from "@/lib/boardService";
import { getUserId } from "@/lib/userService";
import Link from "next/link";

export default function BoardsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      if (session?.user?.uid) {
        try {
          const userBoards = await getUserBoards(session.user.uid);
          setBoards(userBoards);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [session]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recipe Boards</h1>
        <Link href="/main/profile/boards/new">
          <button className="px-4 py-2 bg-red text-white rounded-lg">
            Create New Board
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading your boards...</p>
      ) : boards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(`/main/profile/boards/${board.id}`)}
            >
              <h2 className="text-xl font-semibold">{board.name}</h2>
              {board.description && (
                <p className="text-gray/70 mt-1">{board.description}</p>
              )}
              <div className="mt-2 flex items-center">
                <span className="text-gray/70">
                  {board.isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray mb-4">You haven&apos;t created any boards yet.</p>
          <Link href="/main/profile/boards/new">
            <button className="px-4 py-2 bg-red text-white rounded-lg">
              Create Your First Board
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}