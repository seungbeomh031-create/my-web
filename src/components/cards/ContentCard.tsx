import React, { useState } from 'react';
import { Heart, Film, Tv, Calendar } from 'lucide-react';
import type { ContentItem } from '../../types';
import { StarRating } from '../common/StarRating';

interface ContentCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  onToggleFavorite: (item: ContentItem, e: React.MouseEvent) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onClick,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  const isMovie = item.type === 'movie';
  const badgeColor = isMovie 
    ? 'bg-rose-50 text-rose-600 border-rose-100' 
    : 'bg-sky-50 text-sky-600 border-sky-100';

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1"
    >
      {/* 포스터 이미지 영역 (2:3 비율) */}
      <div className="relative aspect-2/3 w-full bg-stone-100 overflow-hidden">
        {item.coverUrl && !imageError ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center">
            {isMovie ? <Film className="w-10 h-10 mb-2 stroke-1 text-stone-300" /> : <Tv className="w-10 h-10 mb-2 stroke-1 text-stone-300" />}
            <span className="text-xs text-stone-400 font-medium">이미지 없음</span>
          </div>
        )}

        {/* 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* 즐겨찾기 버튼 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item, e);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-xs hover:bg-white transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
          title={item.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 등록'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              item.isFavorite
                ? 'fill-rose-500 text-rose-500'
                : 'text-stone-400 hover:text-rose-400'
            }`}
          />
        </button>

        {/* 개봉/방영 연도 배지 */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1">
          <Calendar className="w-3 h-3 text-stone-300" />
          <span>{item.year}</span>
        </div>
      </div>

      {/* 카드 콘텐츠 정보 */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* 장르 및 별점 */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {item.genre}
            </span>
            <StarRating rating={item.rating} size="sm" />
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-stone-950">
            {item.title}
          </h3>
        </div>

        {/* 짧은 감상평 */}
        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed bg-stone-50/60 p-2 rounded-xl border border-stone-100">
          {item.comment || '남겨진 감상평이 없습니다.'}
        </p>
      </div>
    </div>
  );
};
