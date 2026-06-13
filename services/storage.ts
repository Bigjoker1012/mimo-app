import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(
  path: string,
  uri: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });

  return getDownloadURL(storageRef);
}

export async function uploadUserPhoto(userId: string, photoUri: string): Promise<string> {
  const path = `users/${userId}/profile.jpg`;
  return uploadImage(path, photoUri);
}

export async function uploadTryOnResult(
  userId: string,
  resultId: string,
  photoUri: string
): Promise<string> {
  const path = `users/${userId}/results/${resultId}.jpg`;
  return uploadImage(path, photoUri);
}
