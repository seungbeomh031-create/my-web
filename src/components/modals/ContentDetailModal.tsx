import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Edit3, 
  Trash2, 
  Calendar, 
  Film, 
  Tv, 
  Disc3, 
  Mic2,
  Bookmark
} from 'lucide-react';
import type { ContentItem } from '../../types';
import { StarRating } from '../common/StarRating';

interface ContentDetailModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (itemId: string) => void;
  onToggleFavorite: (item: ContentItem) => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const imageError = Boolean(item.coverUrl && failedUrl === item.coverUrl);
  const isMovie = item.type === 'movie';
  const isDrama = item.type === 'drama';
  const isMusic = item.type === 'music';

  const handleDelete = () => {
    if (confirm(`'${item.title}' 콘텐츠를 삭제하시겠습니까?`)) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 및 즐겨찾기 버튼 */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(item)}
            className="p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs hover:bg-white transition-all cursor-pointer"
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
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs hover:bg-white text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 모달 본문 레이아웃: 이미지 + 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-5 bg-[#FAF8F5]">
          {/* 이미지 영역 */}
          <div className="md:col-span-2 bg-stone-100 relative min-h-[260px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
            {item.coverUrl && !imageError ? (
              <img
                src={item.coverUrl}
                alt={item.title}
                onError={() => setFailedUrl(item.coverUrl || null)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-stone-400 text-center">
                {isMovie && <Film className="w-12 h-12 mb-2 stroke-1 text-stone-300" />}
                {isDrama && <Tv className="w-12 h-12 mb-2 stroke-1 text-stone-300" />}
                {isMusic && <Disc3 className="w-12 h-12 mb-2 stroke-1 text-stone-300" />}
                <span className="text-xs">등록된 이미지가 없습니다</span>
              </div>
            )}
          </div>

          {/* 상세 정보 영역 */}
          <div className="md:col-span-3 p-6 sm:p-7 flex flex-col justify-between bg-white">
            <div className="space-y-4">
              {/* 장르 및 연도 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  {item.genre}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.year}년
                </span>
              </div>

              {/* 제목 */}
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
                {item.title}
              </h1>

              {/* 노래 전용 정보 (가수, 앨범) */}
              {isMusic && (
                <div className="space-y-1 py-1 border-y border-stone-100 text-xs">
                  {item.artist && (
                    <div className="flex items-center gap-2 text-stone-700 font-medium">
                      <Mic2 className="w-3.5 h-3.5 text-purple-500" />
                      <span>{item.artist}</span>
                    </div>
                  )}
                  {item.album && (
                    <div className="flex items-center gap-2 text-stone-500">
                      <Disc3 className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.album}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 별점 영역 */}
              <div className="flex items-center gap-2">
                <StarRating rating={item.rating} size="md" />
                <span className="text-xs font-semibold text-stone-600">
                  {item.rating} / 5.0
                </span>
              </div>

              {/* 감상평 내용 */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/60">
                <h4 className="text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  감상평 및 기록
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {item.comment || '남겨진 감상평이 없습니다.'}
                </p>
              </div>
            </div>

            {/* 하단 수정 및 삭제 버튼 액션 바 */}
            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                등록일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onEdit(item);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>수정</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>삭제</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
