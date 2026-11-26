import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1 ~ 5
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`transition-transform ${
              interactive 
                ? 'cursor-pointer hover:scale-125 focus:outline-none' 
                : 'cursor-default'
            }`}
            title={`${starValue}점`}
          >
            <Star
              className={`${sizeMap[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-stone-200 text-stone-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
