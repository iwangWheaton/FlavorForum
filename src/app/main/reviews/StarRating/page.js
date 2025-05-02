// src/components/RecipePage.js
//https://github.com/alekspopovic/star-rating/tree/main/src
"use client";

import "./stars.css";
import { useState, useEffect } from "react"; // Import useEffect here
import { HandleUserRating } from "@/lib/ratingService";
import { useSession } from "next-auth/react";

const DEFAULT_COUNT = 5;
const DEFAULT_ICON = "🍔";
const DEFAULT_UNSELECTED_COLOR = "grey";
const DEFAULT_COLOR = "yellow";
const DEFAULT_ITEM_TITLE = "Recipe";

export default function Stars({ count, defaultRating, icon, color, iconSize, userId, itemtitle, }) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(defaultRating);
  const [temporaryRating, setTemporaryRating] = useState(0);
  const [finalUserId, setFinalUserId] = useState(null);

  const [ratingData, setRatingData] = useState({
    userId: null,  // Initialize as null
    rating: rating || 0,
    itemtitle: itemtitle || "Recipe"
  });
  console.log("itemtitle:", itemtitle); // Log to verify what was passed in

  // Update finalUserId and ratingData when session changes
  useEffect(() => {
    if (status === "authenticated") {
      const userEmail = session?.user?.email;
      setFinalUserId(userEmail || userId); // Set finalUserId
      setRatingData((prevData) => ({
        ...prevData,
        userId: userEmail || userId, // Set userId in ratingData
      }));
    } else if (status === "unauthenticated") {
      setFinalUserId(userId); // Fallback to userId prop when unauthenticated
      setRatingData((prevData) => ({
        ...prevData,
        userId: userId, // Set userId in ratingData
      }));
    }
  }, [session, status, userId]);

  if (status === "loading") {
    return <div>Loading...</div>;  // Show loading state while session data loads
  }

  let stars = Array(count || DEFAULT_COUNT).fill(icon || DEFAULT_ICON);

  const handleClick = async (newRating, e) => {
    e.preventDefault();
    console.log("Session data:", session);
    setRating(newRating);

    if (!finalUserId) {
      alert("Please sign in to rate this item.");
      return;
    }
    const updatedRatingData = {
      ...ratingData,
      rating: newRating,           // ✅ include the latest rating
      itemtitle: itemtitle || "Recipe", // ✅ ensure item title is included
      userId: finalUserId,         // ✅ ensure userId is consistent
    };
    try {
      // Call HandleUserRating once with the correct ratingData and finalUserId
      await HandleUserRating(updatedRatingData, finalUserId);
    } catch (error) {
      console.error("Error handling user rating:", error);
    }
  };

  return (
    <div className="starsContainer">
      {stars.map((item, index) => {
        const isActiveColor = (rating || temporaryRating) && (index < rating || index < temporaryRating);
        let elementColor = isActiveColor ? color || DEFAULT_COLOR : DEFAULT_UNSELECTED_COLOR;

        return (
          <div
            className="star"
            key={index}
            style={{
              fontSize: iconSize ? `${iconSize}px` : "14px",
              color: elementColor,
              filter: `${isActiveColor ? "grayscale(0%)" : "grayscale(100%)"}`,
            }}
            onMouseEnter={() => setTemporaryRating(index + 1)}
            onMouseLeave={() => setTemporaryRating(0)}
            onClick={(e) => handleClick(index + 1, e)}
          >
            {icon || DEFAULT_ICON}
          </div>
        );
      })}
    </div>
  );
}
