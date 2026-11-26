import React from 'react';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';
import { isCloudinaryConfigured } from '../../services/storageService';

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const FirebaseInfoModal: React.FC<FirebaseInfoModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  if (!isOpen) return null;

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
            <Database className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-serif font-bold text-stone-800">
              Firebase 및 저장소 연동 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 space-y-4 text-xs text-stone-600 leading-relaxed">
          {/* 현재 연동 상태 배너 */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isFirebaseConfigured
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            {isFirebaseConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {isFirebaseConfigured
                  ? 'Firebase가 성공적으로 연동되었습니다.'
                  : '현재 로컬 체험 모드로 실행 중입니다.'}
              </h4>
              <p className="mt-1 text-xs opacity-90">
                {isFirebaseConfigured
                  ? '로그인 시 Cloud Firestore에 컬렉션 데이터가 안전하게 동기화됩니다.'
                  : 'Firebase API 키가 설정되지 않아도 브라우저 LocalStorage를 통해 추가, 수정, 삭제, 즐겨찾기 등 모든 기능이 정상 작동합니다.'}
              </p>
            </div>
          </div>

          {/* Cloudinary 연동 상태 배너 */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isCloudinaryConfigured
              ? 'bg-sky-50/80 border-sky-200 text-sky-800'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}>
            {isCloudinaryConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {isCloudinaryConfigured
                  ? 'Cloudinary 이미지 저장소가 연동되었습니다.'
                  : 'Cloudinary 미설정 (로컬 이미지 변환 모드)'}
              </h4>
              <p className="mt-1 text-xs opacity-90">
                {isCloudinaryConfigured
                  ? '콘텐츠 등록 및 수정 시 업로드하는 포스터/앨범 이미지가 Cloudinary CDN에 안전하게 저장됩니다.'
                  : '환경 변수(.env)에 Cloudinary 설정이 없어도 브라우저 로컬 이미지 변환 방식으로 정상 동작합니다.'}
              </p>
            </div>
          </div>

          {/* Firebase 연결 가이드 */}
          <div className="space-y-2">
            <h5 className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
              <Key className="w-3.5 h-3.5 text-stone-500" />
              실제 Firebase 프로젝트 연동 방법
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
              <li>Firebase 콘솔에서 새 프로젝트를 생성합니다.</li>
              <li>Authentication(Google 로그인 활성화), Firestore Database, Storage를 생성합니다.</li>
              <li>
                프로젝트 루트의 <code className="bg-stone-200/80 px-1 py-0.5 rounded text-[11px]">.env</code> 파일에 Firebase 콘솔의 웹 앱 설정 키를 입력합니다.
              </li>
              <li>보안을 위한 Firestore 규칙은 루트의 <code className="bg-stone-200/80 px-1 py-0.5 rounded text-[11px]">firestore.rules</code> 파일을 적용하시면 됩니다.</li>
            </ol>
          </div>

          {/* 샘플 데이터 복원 버튼 */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-800 block text-xs">초기 샘플 데이터 초기화</span>
              <span className="text-[11px] text-stone-400">둘러보기용 초기 데이터로 되돌립니다.</span>
            </div>
            <button
              onClick={() => {
                if (confirm('샘플 데이터 상태로 초기화하시겠습니까? (기존에 로컬에 추가한 데이터가 초기화됩니다)')) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>샘플 복원</span>
            </button>
          </div>
        </div>

        {/* 모달 닫기 버튼 */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
