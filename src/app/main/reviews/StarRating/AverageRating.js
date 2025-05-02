"use client";

import { useEffect, useState } from 'react';
import { getRecipeRatings } from '@/lib/ratingService';

const AverageRating = ({ itemtitle }) => {
  const [average, setAverage] = useState(null);

  useEffect(() => {
    const getAverage = async () => {
      const avg = await getRecipeRatings(itemtitle);
      setAverage(avg);
    };

    if (itemtitle) getAverage();
  }, [itemtitle]);

  return (
    <div className="text-sm text-black mt-2">
      {average !== null ? `Average Rating: ${average.toFixed(1)} 🍔` : 'No ratings yet'}
    </div>
  );
};

export default AverageRating;