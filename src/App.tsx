import React, { useState, useEffect, useCallback } from 'react';
import type { ContentItem, ContentType, SortOption, UserProfile } from './types';
import { onAuthStateChangedSafe } from './firebase/config';
import { 
  getContentItems, 
  addContentItem, 
  updateContentItem, 
  deleteContentItem, 
  toggleFavoriteStatus,
  resetToSampleData 
} from './services/contentService';
import { Navbar } from './components/common/Navbar';
import { ContentView } from './components/views/ContentView';
import { ContentFormModal } from './components/modals/ContentFormModal';
import { ContentDetailModal } from './components/modals/ContentDetailModal';
import { FirebaseInfoModal } from './components/modals/FirebaseInfoModal';
import { AuthModal } from './components/modals/AuthModal';

export const App: React.FC = () => {
  // 현재 선택된 탭: movie | drama | music
  const [activeTab, setActiveTab] = useState<ContentType>('movie');

  // 사용자 정보 (Firebase Auth)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // 콘텐츠 목록 (타입별)
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 검색, 필터, 정렬 상태
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('latest');

  // 모달 제어 상태
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [isFirebaseInfoOpen, setIsFirebaseInfoOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Firebase Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChangedSafe((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 탭 변경 시 장르 및 검색어 초기화
  const handleTabChange = (newTab: ContentType) => {
    setActiveTab(newTab);
    setSelectedGenre('all');
    setSearchQuery('');
    setShowFavoritesOnly(false);
  };

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContentItems(activeTab, currentUser?.uid);
      setItems(data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 콘텐츠 등록/수정 처리
  const handleFormSubmit = async (
    itemData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingItem) {
      // 수정
      const updated = await updateContentItem(
        {
          ...editingItem,
          ...itemData,
        },
        currentUser?.uid
      );
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      if (detailItem && detailItem.id === updated.id) {
        setDetailItem(updated);
      }
    } else {
      // 추가
      const newItem = await addContentItem(itemData, currentUser?.uid);
      setItems((prev) => [newItem, ...prev]);
    }
  };

  // 콘텐츠 삭제 처리
  const handleDeleteItem = async (itemId: string) => {
    await deleteContentItem(itemId, currentUser?.uid);
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    if (detailItem && detailItem.id === itemId) {
      setDetailItem(null);
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async (item: ContentItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updated = await toggleFavoriteStatus(item, currentUser?.uid);
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    if (detailItem && detailItem.id === updated.id) {
      setDetailItem(updated);
    }
  };

  // 수정 모달 열기
  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  // 신규 추가 모달 열기
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  // 샘플 데이터 복원
  const handleResetSampleData = () => {
    resetToSampleData(currentUser?.uid);
    loadData();
  };

  // 인증 모달 열기
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* 상단 고정 네비게이션 바 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onOpenFirebaseInfo={() => setIsFirebaseInfoOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* 메인 콘텐츠 컨테이너 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-3" />
            <p className="text-xs text-stone-500 font-medium">컬렉션을 불러오는 중입니다...</p>
          </div>
        ) : (
          <ContentView
            type={activeTab}
            items={items}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onOpenAddModal={handleOpenAdd}
            onCardClick={(item) => setDetailItem(item)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="border-t border-stone-200/60 bg-[#FAF8F5] py-8 text-center text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-700">MY COLLECTION</span>
            <span>·</span>
            <span>나만의 영화, 드라마, 음악 라이브러리</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-600">
            <span>React + TypeScript + Vite + Firebase</span>
            <button
              onClick={() => setIsFirebaseInfoOpen(true)}
              className="underline hover:text-stone-700 cursor-pointer"
            >
              연동 가이드
            </button>
          </div>
        </div>
      </footer>

      {/* 콘텐츠 추가/수정 모달 */}
      <ContentFormModal
        isOpen={isFormModalOpen}
        type={activeTab}
        editingItem={editingItem}
        userId={currentUser?.uid}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* 콘텐츠 상세 보기 모달 */}
      <ContentDetailModal
        isOpen={Boolean(detailItem)}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Firebase 연동 가이드 모달 */}
      <FirebaseInfoModal
        isOpen={isFirebaseInfoOpen}
        onClose={() => setIsFirebaseInfoOpen(false)}
        onResetData={handleResetSampleData}
      />

      {/* 로그인 및 회원가입 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};

export default App;
