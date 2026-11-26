import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type Auth,
  type User,
  type NextOrObserver,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// 실제 유효한 Firebase 환경 변수가 설정되었는지 확인
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== '' &&
    firebaseConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
export const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase 초기화 중 경고 (로컬 모드로 폴백):', err);
  }
}

export { app, auth, db };

/**
 * 이메일 및 비밀번호로 회원가입
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase 환경 변수 설정이 완료되지 않았습니다.');
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
    await credential.user.reload();
  }

  // Firestore 사용자 프로필 문서 생성
  if (db && credential.user) {
    try {
      const userRef = doc(db, 'users', credential.user.uid);
      await setDoc(
        userRef,
        {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: displayName || credential.user.email?.split('@')[0],
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('사용자 프로필 Firestore 동기화 건너뜀:', e);
    }
  }

  return auth.currentUser || credential.user;
};

/**
 * 이메일 및 비밀번호로 로그인
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase 환경 변수 설정이 완료되지 않았습니다.');
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

/**
 * Google 소셜 로그인
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase 환경 변수 설정이 완료되지 않았습니다.');
  }
  const result = await signInWithPopup(auth, googleProvider);

  // Firestore 사용자 정보 업데이트
  if (db && result.user) {
    try {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Google 로그인 사용자 정보 Firestore 동기화 건너뜀:', e);
    }
  }

  return result.user;
};

/**
 * 로그아웃
 */
export const logoutUser = async (): Promise<void> => {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
};

/**
 * 안전한 onAuthStateChanged 래퍼
 */
export const onAuthStateChangedSafe = (
  nextOrObserver: NextOrObserver<User>
) => {
  if (isFirebaseConfigured && auth) {
    return firebaseOnAuthStateChanged(auth, nextOrObserver);
  }
  return () => {};
};

/**
 * Firebase 오류 코드를 사용자 친화적 한국어 메시지로 변환
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다.';
    case 'auth/user-disabled':
      return '해당 계정은 비활성화되었습니다.';
    case 'auth/user-not-found':
      return '가입되지 않은 이메일 주소입니다.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 일치하지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 가입되어 있는 이메일 주소입니다.';
    case 'auth/weak-password':
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    case 'auth/popup-closed-by-user':
      return '로그인 팝업창이 닫혔습니다.';
    case 'auth/operation-not-allowed':
      return 'Firebase 콘솔에서 해당 로그인 방법이 활성화되어 있지 않습니다. Authentication > Sign-in method 설정을 확인해주세요.';
    case 'auth/unauthorized-domain':
      return '현재 도메인이 Firebase 승인된 도메인에 등록되어 있지 않습니다. Firebase 콘솔 설정을 확인해주세요.';
    default:
      return '인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

export type { User };
