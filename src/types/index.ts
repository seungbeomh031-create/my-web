export type ContentType = 'movie' | 'drama' | 'music';

export const MOVIE_GENRES = [
  '로맨스',
  '액션',
  '공포',
  '재난',
  'SF',
  '역사',
  '코미디',
] as const;
export type MovieGenre = typeof MOVIE_GENRES[number];

export const DRAMA_GENRES = [
  '로맨스',
  '액션',
  '공포',
  '재난',
  'SF',
  '역사',
  '코미디',
] as const;
export type DramaGenre = typeof DRAMA_GENRES[number];

export const MUSIC_GENRES = [
  '발라드',
  'K-POP',
  'POP',
  '힙합',
  'R&B',
  '캐롤',
] as const;
export type MusicGenre = typeof MUSIC_GENRES[number];

export type GenreType = MovieGenre | DramaGenre | MusicGenre;

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  year: number | string;
  genre: GenreType;
  rating: number; // 1 ~ 5
  comment: string; // 감상평
  coverUrl?: string; // 포스터 또는 앨범 커버 URL
  isFavorite: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
  userId?: string;

  // 노래 전용 필드
  artist?: string; // 가수
  album?: string;  // 앨범명
}

export type SortOption = 'latest' | 'oldest' | 'rating-desc' | 'rating-asc' | 'year-desc';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}
