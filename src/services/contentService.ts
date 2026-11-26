import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { ContentItem, ContentType } from '../types';
import { INITIAL_SAMPLE_DATA } from '../data/initialData';

const LOCAL_STORAGE_KEY_PREFIX = 'my_collection_items_';
const LOCAL_STORAGE_SEEDED_KEY = 'my_collection_seeded_v1';

/**
 * 사용자별 또는 로컬 저장소의 콘텐츠 목록을 가져옵니다.
 */
export const getContentItems = async (
  type: ContentType,
  userId?: string | null
): Promise<ContentItem[]> => {
  // 1. Firebase 사용 가능 & 로그인된 경우: Cloud Firestore에서 조회
  if (isFirebaseConfigured && db && userId) {
    try {
      const userColRef = collection(db, 'users', userId, 'contents');
      const q = query(userColRef, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      const items: ContentItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ContentItem);
      });

      return items;
    } catch (err) {
      console.error('Firestore 조회 실패, 로컬 저장소에서 대체 조회합니다:', err);
    }
  }

  // 2. 비로그인 또는 Firebase 미설정: 로컬스토리지 사용
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  let stored = localStorage.getItem(storageKey);

  // 최초 접속 시 둘러보기용 샘플 데이터 자동 시딩 (초기화)
  if (!stored && !localStorage.getItem(LOCAL_STORAGE_SEEDED_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_SEEDED_KEY, 'true');
    localStorage.setItem(storageKey, JSON.stringify(INITIAL_SAMPLE_DATA));
    stored = JSON.stringify(INITIAL_SAMPLE_DATA);
  }

  if (!stored) {
    return [];
  }

  try {
    const allItems: ContentItem[] = JSON.parse(stored);
    return allItems.filter(item => item.type === type);
  } catch (error) {
    console.error('로컬스토리지 파싱 오류:', error);
    return [];
  }
};

/**
 * 새 콘텐츠 추가
 */
export const addContentItem = async (
  itemData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string | null
): Promise<ContentItem> => {
  const newItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  
  const newItem: ContentItem = {
    ...itemData,
    id: newItemId,
    userId: userId || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // Firestore 저장
  if (isFirebaseConfigured && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'contents', newItemId);
      await setDoc(docRef, newItem);
      return newItem;
    } catch (err) {
      console.warn('Firestore 저장 실패, 로컬에 저장합니다:', err);
    }
  }

  // 로컬스토리지 저장
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  const existingJson = localStorage.getItem(storageKey);
  const existingItems: ContentItem[] = existingJson ? JSON.parse(existingJson) : [];
  const updatedItems = [newItem, ...existingItems];
  localStorage.setItem(storageKey, JSON.stringify(updatedItems));

  return newItem;
};

/**
 * 콘텐츠 수정
 */
export const updateContentItem = async (
  item: ContentItem,
  userId?: string | null
): Promise<ContentItem> => {
  const updatedItem: ContentItem = {
    ...item,
    updatedAt: new Date().toISOString(),
  };

  // Firestore 업데이트
  if (isFirebaseConfigured && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'contents', updatedItem.id);
      await setDoc(docRef, updatedItem, { merge: true });
      return updatedItem;
    } catch (err) {
      console.warn('Firestore 업데이트 실패, 로컬에 업데이트합니다:', err);
    }
  }

  // 로컬스토리지 업데이트
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  const existingJson = localStorage.getItem(storageKey);
  if (existingJson) {
    const existingItems: ContentItem[] = JSON.parse(existingJson);
    const updatedItems = existingItems.map(it => it.id === updatedItem.id ? updatedItem : it);
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
  }

  return updatedItem;
};

/**
 * 콘텐츠 삭제
 */
export const deleteContentItem = async (
  itemId: string,
  userId?: string | null
): Promise<void> => {
  // Firestore 삭제
  if (isFirebaseConfigured && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'contents', itemId);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.warn('Firestore 삭제 실패, 로컬에서 삭제합니다:', err);
    }
  }

  // 로컬스토리지 삭제
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  const existingJson = localStorage.getItem(storageKey);
  if (existingJson) {
    const existingItems: ContentItem[] = JSON.parse(existingJson);
    const filtered = existingItems.filter(it => it.id !== itemId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }
};

/**
 * 즐겨찾기 토글
 */
export const toggleFavoriteStatus = async (
  item: ContentItem,
  userId?: string | null
): Promise<ContentItem> => {
  const toggled: ContentItem = {
    ...item,
    isFavorite: !item.isFavorite,
    updatedAt: new Date().toISOString(),
  };
  return updateContentItem(toggled, userId);
};

/**
 * 샘플 데이터 복원 (초기 상태로 되돌리기)
 */
export const resetToSampleData = (userId?: string | null): void => {
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
  localStorage.setItem(storageKey, JSON.stringify(INITIAL_SAMPLE_DATA));
};
