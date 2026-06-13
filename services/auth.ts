import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

export async function initAuth(): Promise<User> {
  const user = auth.currentUser;
  if (user) return user;

  const result = await signInAnonymously(auth);
  return result.user;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
