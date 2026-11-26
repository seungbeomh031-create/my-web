import React, { useState } from 'react';
import { 
  Film, 
  Tv, 
  Music, 
  BookmarkCheck, 
  LogIn, 
  LogOut, 
  UserPlus,
  Database,
  Menu,
  X 
} from 'lucide-react';
import type { ContentType, UserProfile } from '../../types';
import { isFirebaseConfigured, logoutUser } from '../../firebase/config';

interface NavbarProps {
  activeTab: ContentType;
  onTabChange: (tab: ContentType) => void;
  currentUser: UserProfile | null;
  onOpenFirebaseInfo: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenFirebaseInfo,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { type: ContentType; label: string; icon: React.ReactNode; accent: string }[] = [
    { type: 'movie', label: 'MOVIE', icon: <Film className="w-4 h-4" />, accent: 'text-rose-500' },
    { type: 'drama', label: 'DRAMA', icon: <Tv className="w-4 h-4" />, accent: 'text-sky-500' },
    { type: 'music', label: 'MUSIC', icon: <Music className="w-4 h-4" />, accent: 'text-purple-500' },
  ];

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logoutUser();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onTabChange('movie')} 
            className="flex items-center gap-2.5 text-stone-800 hover:text-stone-900 transition-colors cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-800 text-stone-50 flex items-center justify-center shadow-sm">
              <BookmarkCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg font-bold text-stone-800">
                MY COLLECTION
              </span>
              <span className="hidden sm:block text-[10px] text-stone-600 tracking-wider font-sans uppercase">
                Personal Media Archive
              </span>
            </div>
          </button>
        </div>

        {/* 데스크톱 네비게이션 탭 */}
        <nav className="hidden md:flex items-center bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/60 shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type;
            let activeBg = 'bg-white text-stone-800 shadow-sm font-semibold';
            if (tab.type === 'movie' && isActive) activeBg += ' text-rose-600';
            if (tab.type === 'drama' && isActive) activeBg += ' text-sky-600';
            if (tab.type === 'music' && isActive) activeBg += ' text-purple-600';

            return (
              <button
                key={tab.type}
                onClick={() => onTabChange(tab.type)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? activeBg
                    : 'text-stone-700 hover:text-stone-800 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 우측 인증 및 상태 버튼 */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Firebase 연결 상태 배지 */}
          <button
            onClick={onOpenFirebaseInfo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              isFirebaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Firebase 연동 정보 보기"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isFirebaseConfigured ? 'Firebase 연결됨' : '로컬 모드 (체험)'}</span>
          </button>

          {/* 사용자 정보 또는 로그인/회원가입 메뉴 */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || '사용자'}
                  className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-800 text-amber-200 text-xs font-bold flex items-center justify-center shadow-xs">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-stone-800 max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-stone-600 max-w-[120px] truncate">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-stone-600 hover:text-red-500 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer ml-1"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-medium shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-500" />
                <span>로그인</span>
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium shadow-2xs hover:bg-stone-800 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-200" />
                <span>회원가입</span>
              </button>
            </div>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg bg-stone-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-stone-200 px-4 py-3 space-y-3">
          <div className="grid grid-cols-3 gap-2 pb-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => {
                    onTabChange(tab.type);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-800 text-white'
                      : 'bg-white border border-stone-200 text-stone-700'
                  }`}
                >
                  <span className="mb-1">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenFirebaseInfo();
                  setMobileMenuOpen(false);
                }}
                className="text-stone-700 underline text-xs cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                <span>{isFirebaseConfigured ? 'Firebase 연결됨' : '로컬 모드 가이드'}</span>
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || '사용자'}
                      className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-800 text-amber-200 text-xs font-bold flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-stone-800">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-stone-600">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-stone-200 text-stone-800 rounded-xl text-xs font-medium cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-500" />
                  <span>로그인</span>
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-200" />
                  <span>회원가입</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
