import React from 'react';
import { Film, Tv, Music, Plus, SearchX } from 'lucide-react';
import type { ContentType } from '../../types';

interface EmptyStateProps {
  type: ContentType;
  isSearching: boolean;
  onOpenAddModal: () => void;
  onResetSearch: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  isSearching,
  onOpenAddModal,
  onResetSearch,
}) => {
  const infoMap = {
    movie: {
      name: '영화',
      icon: <Film className="w-8 h-8 text-rose-400" />,
      color: 'text-rose-500 hover:text-rose-600',
      btnColor: 'bg-rose-500 hover:bg-rose-600',
    },
    drama: {
      name: '드라마',
      icon: <Tv className="w-8 h-8 text-sky-400" />,
      color: 'text-sky-500 hover:text-sky-600',
      btnColor: 'bg-sky-500 hover:bg-sky-600',
    },
    music: {
      name: '노래',
      icon: <Music className="w-8 h-8 text-purple-400" />,
      color: 'text-purple-500 hover:text-purple-600',
      btnColor: 'bg-purple-500 hover:bg-purple-600',
    },
  }[type];

  if (isSearching) {
    return (
      <div className="py-20 text-center bg-white/60 rounded-3xl border border-dashed border-stone-200 p-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-stone-800">
          검색 결과가 없습니다
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          단어를 변경하거나 필터를 초기화해 보세요.
        </p>
        <button
          onClick={onResetSearch}
          className="mt-4 px-4 py-2 bg-stone-200 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-300 transition-colors"
        >
          검색 및 필터 초기화
        </button>
      </div>
    );
  }

  return (
    <div className="py-20 text-center bg-white/60 rounded-3xl border border-dashed border-stone-300/80 p-8 shadow-2xs">
      <div className="w-16 h-16 mx-auto mb-4 bg-stone-50 rounded-2xl flex items-center justify-center shadow-2xs border border-stone-100">
        {infoMap.icon}
      </div>
      <h3 className="text-lg font-serif font-bold text-stone-800">
        등록된 {infoMap.name}가 없습니다
      </h3>
      <p className="mt-1.5 text-sm text-stone-500 max-w-sm mx-auto">
        기억에 남는 인생 {infoMap.name}를 첫 번째 컬렉션으로 기록해보세요.
      </p>
      <button
        onClick={onOpenAddModal}
        className={`mt-5 inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all cursor-pointer ${infoMap.btnColor}`}
      >
        <Plus className="w-4 h-4" />
        <span>첫 번째 {infoMap.name} 등록하기</span>
      </button>
    </div>
  );
};
