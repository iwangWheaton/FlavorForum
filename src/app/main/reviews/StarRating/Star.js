// src/components/RecipePage.js
//https://github.com/alekspopovic/star-rating/tree/main/src
"use client";


import "./stars.css";
import { useState } from "react";

const DEFAULT_COUNT = 5;
const DEFAULT_ICON = "🍔";
const DEFAULT_UNSELECTED_COLOR = "grey";
const DEFAULT_COLOR = "yellow";

export default function Stars({ count, defaultRating, icon, color, iconSize }) {
  const [rating, setRating] = useState(defaultRating);
  const [temporaryRating, setTemporaryRating] = useState(0);

  let stars = Array(count || DEFAULT_COUNT).fill(icon || DEFAULT_ICON);

  const handleClick = (rating, e) => {
    e.preventDefault();
    setRating(rating);
    localStorage.setItem("starRating", rating);
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