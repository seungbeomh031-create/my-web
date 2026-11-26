import React, { useState } from 'react';
import { Heart, Disc3, Mic2, Calendar } from 'lucide-react';
import type { ContentItem } from '../../types';
import { StarRating } from '../common/StarRating';

interface MusicCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  onToggleFavorite: (item: ContentItem, e: React.MouseEvent) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  item,
  onClick,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1"
    >
      {/* 앨범 커버 (1:1 정사각형) */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        {item.coverUrl && !imageError ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4">
            <Disc3 className="w-12 h-12 mb-2 stroke-1 text-stone-300" />
            <span className="text-xs text-stone-400 font-medium">커버 없음</span>
          </div>
        )}

        {/* LP 비닐 레코드 디테일 효과 (우측 반원 엣지) */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/30 border border-white/20 pointer-events-none opacity-0 group-hover:opacity-60 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />

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

        {/* 발매 연도 배지 */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1">
          <Calendar className="w-3 h-3 text-stone-300" />
          <span>{item.year}</span>
        </div>
      </div>

      {/* 노래 및 앨범 정보 */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* 장르 및 별점 */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-purple-50 text-purple-600 border-purple-100">
              {item.genre}
            </span>
            <StarRating rating={item.rating} size="sm" />
          </div>

          {/* 노래 제목 */}
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-purple-700 transition-colors">
            {item.title}
          </h3>

          {/* 가수 정보 */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-600 font-medium">
            <Mic2 className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">{item.artist || '아티스트 미상'}</span>
          </div>

          {/* 앨범명 */}
          {item.album && (
            <div className="mt-0.5 text-[11px] text-stone-400 truncate">
              {item.album}
            </div>
          )}
        </div>

        {/* 감상평이 있는 경우 */}
        {item.comment && (
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed bg-stone-50/60 p-2 rounded-xl border border-stone-100">
            {item.comment}
          </p>
        )}
      </div>
    </div>
  );
};
