import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2, BookmarkCheck } from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  signInWithGoogle, 
  getAuthErrorMessage 
} from '../../firebase/config';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      setDisplayName('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 유효성 검사
    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMessage('이름(닉네임)을 입력해주세요.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim());
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code) {
        setErrorMessage(getAuthErrorMessage(error.code));
      } else {
        setErrorMessage(error.message || '인증 처리 중 문제가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code && error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(getAuthErrorMessage(error.code));
      } else if (error.message && !error.message.includes('popup-closed-by-user')) {
        setErrorMessage(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 모달 카드 */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
        {/* 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 & 로고 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 shadow-sm mb-3">
            <BookmarkCheck className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-800">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {mode === 'login'
              ? 'MY COLLECTION 라이브러리에 오신 것을 환영합니다.'
              : '새 계정을 만들고 나만의 컬렉션을 보관하세요.'}
          </p>
        </div>

        {/* 로그인 / 회원가입 탭 전환 */}
        <div className="grid grid-cols-2 p-1 bg-stone-200/60 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 에러 메시지 알림 */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* 소셜 로그인 (Google) */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 transition-all shadow-2xs cursor-pointer mb-4 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Google 계정으로 계속하기</span>
        </button>

        {/* 구분선 */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-[#FAF8F5] px-3 text-[11px] text-stone-500 uppercase tracking-wider">
            또는 이메일로 {mode === 'login' ? '로그인' : '가입'}
          </span>
          <div className="border-t border-stone-200 w-full" />
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                이름 / 닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 홍길동"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-500 focus:outline-hidden focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              이메일 주소
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-500 focus:outline-hidden focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자리 이상 입력해주세요"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-500 focus:outline-hidden focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-500 focus:outline-hidden focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-3 bg-stone-900 text-stone-50 rounded-xl text-xs font-semibold shadow-md hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            ) : null}
            <span>{mode === 'login' ? '로그인' : '회원가입 완료'}</span>
          </button>
        </form>

        {/* 푸터 스위칭 */}
        <div className="mt-5 text-center text-xs text-stone-600">
          {mode === 'login' ? (
            <span>
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="font-semibold text-stone-800 underline hover:text-stone-950 cursor-pointer ml-1"
              >
                회원가입하기
              </button>
            </span>
          ) : (
            <span>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="font-semibold text-stone-800 underline hover:text-stone-950 cursor-pointer ml-1"
              >
                로그인하기
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
