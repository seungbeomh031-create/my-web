import React, { useMemo } from 'react';
import type { ContentItem, ContentType, SortOption } from '../../types';
import { HeaderSection } from '../common/HeaderSection';
import { GenreFilter } from '../common/GenreFilter';
import { ContentCard } from '../cards/ContentCard';
import { MusicCard } from '../cards/MusicCard';
import { EmptyState } from '../common/EmptyState';

interface ContentViewProps {
  type: ContentType;
  items: ContentItem[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenAddModal: () => void;
  onCardClick: (item: ContentItem) => void;
  onToggleFavorite: (item: ContentItem, e: React.MouseEvent) => void;
}

export const ContentView: React.FC<ContentViewProps> = ({
  type,
  items,
  selectedGenre,
  onSelectGenre,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  sortOption,
  onSortChange,
  onOpenAddModal,
  onCardClick,
  onToggleFavorite,
}) => {
  // 1. 장르별 개수 계산 (전체 목록 기준)
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.genre] = (counts[item.genre] || 0) + 1;
    });
    return counts;
  }, [items]);

  // 2. 검색, 장르, 즐겨찾기 필터링
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 즐겨찾기 필터
      if (showFavoritesOnly && !item.isFavorite) {
        return false;
      }

      // 장르 필터
      if (selectedGenre !== 'all' && item.genre !== selectedGenre) {
        return false;
      }

      // 검색어 필터 (제목, 아티스트, 앨범, 감상평)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const commentMatch = item.comment?.toLowerCase().includes(query);
        const genreMatch = item.genre.toLowerCase().includes(query);
        const artistMatch = item.artist?.toLowerCase().includes(query);
        const albumMatch = item.album?.toLowerCase().includes(query);

        return titleMatch || commentMatch || genreMatch || artistMatch || albumMatch;
      }

      return true;
    });
  }, [items, showFavoritesOnly, selectedGenre, searchQuery]);

  // 3. 정렬 로직
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortOption === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'rating-desc') {
        return b.rating - a.rating;
      }
      if (sortOption === 'rating-asc') {
        return a.rating - b.rating;
      }
      if (sortOption === 'year-desc') {
        return Number(b.year) - Number(a.year);
      }
      return 0;
    });
  }, [filteredItems, sortOption]);

  const favoriteCount = useMemo(() => {
    return items.filter(it => it.isFavorite).length;
  }, [items]);

  const isMusic = type === 'music';

  return (
    <div className="w-full">
      {/* 상단 타이틀, 통계, 검색 바 */}
      <HeaderSection
        type={type}
        totalCount={items.length}
        favoriteCount={favoriteCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={onToggleFavoritesOnly}
        sortOption={sortOption}
        onSortChange={onSortChange}
        onOpenAddModal={onOpenAddModal}
      />

      {/* 장르 선택 탭 */}
      <GenreFilter
        type={type}
        selectedGenre={selectedGenre}
        onSelectGenre={onSelectGenre}
        genreCounts={genreCounts}
      />

      {/* 콘텐츠 그리드 영역 */}
      {sortedItems.length === 0 ? (
        <EmptyState
          type={type}
          isSearching={Boolean(searchQuery.trim() || selectedGenre !== 'all' || showFavoritesOnly)}
          onOpenAddModal={onOpenAddModal}
          onResetSearch={() => {
            onSearchChange('');
            onSelectGenre('all');
            if (showFavoritesOnly) onToggleFavoritesOnly();
          }}
        />
      ) : (
        <div className={`grid gap-5 sm:gap-6 ${
          isMusic 
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'
        }`}>
          {sortedItems.map((item) => (
            isMusic ? (
              <MusicCard
                key={item.id}
                item={item}
                onClick={onCardClick}
                onToggleFavorite={onToggleFavorite}
              />
            ) : (
              <ContentCard
                key={item.id}
                item={item}
                onClick={onCardClick}
                onToggleFavorite={onToggleFavorite}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};
