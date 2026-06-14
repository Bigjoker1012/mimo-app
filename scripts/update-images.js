const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } = require('firebase/firestore');

const fs = require('fs');
const path = require('path');
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) env[key.trim()] = value.join('=').trim();
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const IMAGE_MAP = {
  'tshirt_white': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  'tshirt_black': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop',
  'shirt_blue': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
  'jacket_leather': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  'pants_black': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
  'dress_red': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
  'skirt_mini': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop',
  'suit_formal': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
};

async function updateImages() {
  console.log('Updating clothing images...');

  const snapshot = await getDocs(collection(db, 'clothingItems'));

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const newUrl = IMAGE_MAP[data.imageUrl];

    if (newUrl) {
      await updateDoc(doc(db, 'clothingItems', docSnap.id), { imageUrl: newUrl });
      console.log('Updated:', data.name);
    }
  }

  console.log('Done!');
}

updateImages();
