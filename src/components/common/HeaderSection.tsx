import React from 'react';
import { 
  Plus, 
  Search, 
  Heart, 
  ArrowUpDown, 
  Layers
} from 'lucide-react';
import type { ContentType, SortOption } from '../../types';

interface HeaderSectionProps {
  type: ContentType;
  totalCount: number;
  favoriteCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenAddModal: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  type,
  totalCount,
  favoriteCount,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  sortOption,
  onSortChange,
  onOpenAddModal,
}) => {
  const metaMap = {
    movie: {
      title: '영화 서재',
      englishTitle: 'CINEMA ARCHIVE',
      description: '빛과 그림자로 새겨진 순간들, 오래도록 마음에 간직하고 싶은 영화 컬렉션',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      btnBg: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300',
      accentDot: 'bg-rose-400',
    },
    drama: {
      title: '드라마 아카이브',
      englishTitle: 'SERIES COLLECTION',
      description: '시간을 잊고 몰입했던 또 다른 세상, 기억하고 싶은 드라마 이야기',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      btnBg: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-300',
      accentDot: 'bg-sky-400',
    },
    music: {
      title: '뮤직 라이브러리',
      englishTitle: 'VINYL & PLAYLIST',
      description: '하루의 온도를 바꾸는 선율, 귓가에 맴도는 인생 멜로디와 앨범들',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      btnBg: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-300',
      accentDot: 'bg-purple-400',
    },
  };

  const meta = metaMap[type];

  return (
    <section className="mb-8 space-y-6">
      {/* 헤더 타이틀 및 통계 섹션 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full ${meta.accentDot}`} />
            <span className="text-xs font-semibold tracking-widest text-stone-600 uppercase font-sans">
              {meta.englishTitle}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {meta.title}
          </h1>
          <p className="mt-1.5 text-stone-600 text-sm max-w-xl font-normal leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* 통계 배지 및 추가 버튼 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>전체</span>
              <span className="font-semibold text-stone-800">{totalCount}개</span>
            </div>
            <span className="w-px h-3 bg-stone-200 mx-1" />
            <div className="flex items-center gap-1.5 text-rose-500">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>즐겨찾기</span>
              <span className="font-semibold text-rose-600">{favoriteCount}개</span>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className={`flex items-center gap-2 text-white px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer active:scale-95 ${meta.btnBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>콘텐츠 추가</span>
          </button>
        </div>
      </div>

      {/* 검색, 필터, 정렬 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-stone-200/80 shadow-2xs backdrop-blur-xs">
        {/* 검색창 */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${meta.title}에서 제목, 감상평 또는 장르 검색...`}
            className="w-full pl-10 pr-4 py-2 bg-stone-50/80 rounded-xl text-sm text-stone-800 placeholder-stone-500 border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* 즐겨찾기 토글 및 정렬 드롭다운 */}
        <div className="flex items-center gap-2">
          {/* 즐겨찾기만 보기 토글 */}
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showFavoritesOnly
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-stone-50 border-stone-200/80 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            <span>즐겨찾기만</span>
          </button>

          {/* 정렬 드롭다운 */}
          <div className="relative flex items-center bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent border-none text-stone-800 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="latest">최신 등록순</option>
              <option value="oldest">오래된 등록순</option>
              <option value="rating-desc">별점 높은순</option>
              <option value="rating-asc">별점 낮은순</option>
              <option value="year-desc">개봉/발매 연도순</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
