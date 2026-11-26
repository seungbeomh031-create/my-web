import React from 'react';
import type { ContentType } from '../../types';
import { MOVIE_GENRES, DRAMA_GENRES, MUSIC_GENRES } from '../../types';

interface GenreFilterProps {
  type: ContentType;
  selectedGenre: string; // 'all' | GenreType
  onSelectGenre: (genre: string) => void;
  genreCounts: Record<string, number>;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  type,
  selectedGenre,
  onSelectGenre,
  genreCounts,
}) => {
  const genres = type === 'movie' 
    ? MOVIE_GENRES 
    : type === 'drama' 
      ? DRAMA_GENRES 
      : MUSIC_GENRES;

  const accentStyles = {
    movie: {
      active: 'bg-rose-500 text-white shadow-xs border-rose-500',
      hover: 'hover:border-rose-300 hover:text-rose-600',
    },
    drama: {
      active: 'bg-sky-500 text-white shadow-xs border-sky-500',
      hover: 'hover:border-sky-300 hover:text-sky-600',
    },
    music: {
      active: 'bg-purple-500 text-white shadow-xs border-purple-500',
      hover: 'hover:border-purple-300 hover:text-purple-600',
    },
  }[type];

  return (
    <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {/* 전체 버튼 */}
        <button
          onClick={() => onSelectGenre('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            selectedGenre === 'all'
              ? accentStyles.active
              : `bg-white text-stone-600 border-stone-200 ${accentStyles.hover}`
          }`}
        >
          <span>전체</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedGenre === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
          }`}>
            {genreCounts['all'] || 0}
          </span>
        </button>

        {/* 장르별 버튼 */}
        {genres.map((genre) => {
          const count = genreCounts[genre] || 0;
          const isSelected = selectedGenre === genre;

          return (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? accentStyles.active
                  : `bg-white text-stone-600 border-stone-200 ${accentStyles.hover}`
              }`}
            >
              <span>{genre}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
