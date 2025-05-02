// src/components/RecipePage.js
//https://github.com/alekspopovic/star-rating/tree/main/src
"use client";

import "./stars.css";
import { useState } from "react";
import { handleUserRating } from "@/lib/ratingService";
import { useSession } from "next-auth/react";

const DEFAULT_COUNT = 5;
const DEFAULT_ICON = "🍔";
const DEFAULT_UNSELECTED_COLOR = "grey";
const DEFAULT_COLOR = "yellow";
const DEFAULT_ITEM_TITLE = "Recipe";

export default function Stars({ count, defaultRating, icon, color, iconSize, itemTitle, itemId, userEmail }) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(defaultRating);
  const [temporaryRating, setTemporaryRating] = useState(0);

  const [ratingData, setRatingData] = useState({
    userId: session?.user?.email || userEmail,
    itemId: itemId || "123",
    rating: rating || 0,
  });

  const handleChange = (e) => {
    setRatingData({ ...ratingData, [e.target.name]: e.target.value });
  }

  let stars = Array(count || DEFAULT_COUNT).fill(icon || DEFAULT_ICON);

  const handleClick = async (rating, e) => {
    e.preventDefault();
    console.log("Session data:", session);
    setRating(rating);

    try {
      const userId = session?.user?.email;
      if (!userId) {
        alert("Please sign in to rate this item.");
        return;
}

        const ratingData = {
          ...ratingData,
        }
        await HandleUserRating(ratingData, userId, itemId);
      }
    catch (error) {
      console.error("Error handling user rating:", error);
    }
    await HandleUserRating({itemTitle: itemTitle || DEFAULT_ITEM_TITLE, userEmail, itemId });
  };

  return (
    <div className="starsContainer">
      {stars.map((item, index) => {
        const isActiveColor =
          (rating || temporaryRating) &&
          (index < rating || index < temporaryRating);

        let elementColor = "";

        if (isActiveColor) {
          elementColor = color || DEFAULT_COLOR;
        } else {
          elementColor = DEFAULT_UNSELECTED_COLOR;
        }

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
            {icon ? icon : DEFAULT_ICON}
          </div>
        );
      })}
    </div>
  );
}



