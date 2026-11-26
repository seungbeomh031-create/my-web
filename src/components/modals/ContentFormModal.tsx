import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import type { 
  ContentItem, 
  ContentType, 
  GenreType 
} from '../../types';
import { MOVIE_GENRES, DRAMA_GENRES, MUSIC_GENRES } from '../../types';
import { StarRating } from '../common/StarRating';
import { uploadImageFile } from '../../services/storageService';

const CURRENT_YEAR = new Date().getFullYear();

interface ContentFormModalProps {
  isOpen: boolean;
  type: ContentType;
  editingItem?: ContentItem | null;
  userId?: string | null;
  onClose: () => void;
  onSubmit: (itemData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ContentFormModalInner: React.FC<Omit<ContentFormModalProps, 'isOpen'>> = ({
  type,
  editingItem,
  userId,
  onClose,
  onSubmit,
}) => {
  const availableGenres = type === 'movie' 
    ? MOVIE_GENRES 
    : type === 'drama' 
      ? DRAMA_GENRES 
      : MUSIC_GENRES;

  const [title, setTitle] = useState(editingItem?.title ?? '');
  const [year, setYear] = useState<number | string>(editingItem?.year ?? CURRENT_YEAR);
  const [genre, setGenre] = useState<GenreType>(editingItem?.genre ?? availableGenres[0]);
  const [rating, setRating] = useState<number>(editingItem?.rating ?? 5);
  const [comment, setComment] = useState(editingItem?.comment ?? '');
  const [coverUrl, setCoverUrl] = useState(editingItem?.coverUrl ?? '');
  const [artist, setArtist] = useState(editingItem?.artist ?? '');
  const [album, setAlbum] = useState(editingItem?.album ?? '');
  const [isFavorite] = useState(editingItem?.isFavorite ?? false);

  // 이미지 입력 방식 탭 ('file' | 'url')
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await uploadImageFile(file, userId || undefined);
      setCoverUrl(uploadedUrl);
      setPreviewError(false);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('제목을 입력해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        type,
        title: title.trim(),
        year: year || new Date().getFullYear(),
        genre,
        rating,
        comment: comment.trim(),
        coverUrl: coverUrl.trim(),
        isFavorite,
        artist: type === 'music' ? artist.trim() : undefined,
        album: type === 'music' ? album.trim() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabels = {
    movie: { name: '영화', coverLabel: '포스터 이미지' },
    drama: { name: '드라마', coverLabel: '포스터 이미지' },
    music: { name: '노래', coverLabel: '앨범 커버 이미지' },
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg font-serif font-bold text-stone-800">
              {editingItem ? `${typeLabels.name} 정보 수정` : `새로운 ${typeLabels.name} 기록하기`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 제목 입력 */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {typeLabels.name} 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${typeLabels.name} 제목을 입력하세요`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors"
            />
          </div>

          {/* 노래 전용 필드: 가수 및 앨범명 */}
          {type === 'music' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  가수 / 아티스트
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="가수명"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  앨범명
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="앨범명"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* 장르 & 연도 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                장르 선택
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreType)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors cursor-pointer"
              >
                {availableGenres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {type === 'music' ? '발매 연도' : type === 'drama' ? '방영 연도' : '개봉 연도'}
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* 별점 선택 */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              별점 ({rating}점 / 5점)
            </label>
            <div className="flex items-center gap-3 p-3 bg-stone-50/70 rounded-xl border border-stone-200/80">
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={(newVal) => setRating(newVal)}
                size="lg"
              />
              <span className="text-xs text-stone-500 font-medium">별을 클릭해 점수를 매겨보세요</span>
            </div>
          </div>

          {/* 이미지 입력 (파일 업로드 또는 이미지 URL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {typeLabels.coverLabel}
              </label>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'file' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  파일 첨부
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'url' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  URL 입력
                </button>
              </div>
            </div>

            {imageInputMode === 'file' ? (
              <div className="border border-dashed border-stone-300 rounded-2xl p-4 text-center hover:bg-stone-50/50 transition-colors relative">
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-4 text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400 mb-1" />
                    <span className="text-xs">이미지 업로드 처리 중...</span>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 mx-auto mb-1 text-stone-400" />
                    <p className="text-xs font-medium text-stone-700">
                      이미지 파일을 드래그하거나 클릭하여 선택
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">JPG, PNG, WebP (최대 10MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* 이미지 미리보기 */}
            {coverUrl && !uploading && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                {!previewError ? (
                  <img
                    src={coverUrl}
                    alt="미리보기"
                    onError={() => setPreviewError(true)}
                    className="w-12 h-16 object-cover rounded-lg border border-stone-200"
                  />
                ) : (
                  <div className="w-12 h-16 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-[10px]">
                    오류
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-stone-700 block truncate">
                    이미지가 등록되었습니다
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    이미지 제거
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 감상평 입력 */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              한 줄 감상평 및 메모
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="작품을 보고 느낀 감정이나 인상 깊었던 대사 등을 남겨보세요..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 focus:bg-white focus:border-stone-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* 모달 하단 버튼 */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-900 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingItem ? '수정 완료' : '등록하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ContentFormModal: React.FC<ContentFormModalProps> = ({ isOpen, ...props }) => {
  if (!isOpen) return null;
  const modalKey = `${props.type}_${props.editingItem?.id || 'new'}`;
  return <ContentFormModalInner key={modalKey} {...props} />;
};
