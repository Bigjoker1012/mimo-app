import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClothingItem, TryOnResult } from '../types';

const CLOTHING_COLLECTION = 'clothingItems';
const RESULTS_COLLECTION = 'tryOnResults';

export async function getClothingItems(category?: string): Promise<ClothingItem[]> {
  let q;
  if (category) {
    q = query(
      collection(db, CLOTHING_COLLECTION),
      where('category', '==', category)
    );
  } else {
    q = query(collection(db, CLOTHING_COLLECTION));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as ClothingItem[];
}

export async function getClothingItem(id: string): Promise<ClothingItem | null> {
  try {
    const docRef = doc(db, CLOTHING_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (!data) return null;

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as ClothingItem;
  } catch (error) {
    console.error('Error getting clothing item:', error);
    return null;
  }
}

export async function saveTryOnResult(
  userId: string,
  clothingId: string,
  originalPhotoUrl: string,
  resultPhotoUrl: string
): Promise<TryOnResult> {
  const docRef = await addDoc(collection(db, RESULTS_COLLECTION), {
    userId,
    clothingId,
    originalPhotoUrl,
    resultPhotoUrl,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    clothingId,
    originalPhotoUrl,
    resultPhotoUrl,
    createdAt: new Date(),
  };
}
