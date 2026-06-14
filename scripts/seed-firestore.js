const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOTHING_ITEMS = [
  // Футболки
  {
    name: 'Футболка белая',
    category: 'tshirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 80, rotation: 0 },
  },
  {
    name: 'Футболка чёрная',
    category: 'tshirt',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 80, rotation: 0 },
  },
  {
    name: 'Футболка полосатая',
    category: 'tshirt',
    imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 80, rotation: 0 },
  },

  // Рубашки
  {
    name: 'Рубашка голубая',
    category: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 85, rotation: 0 },
  },
  {
    name: 'Рубашка белая',
    category: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 85, rotation: 0 },
  },

  // Куртки
  {
    name: 'Куртка кожаная',
    category: 'jacket',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    overlayConfig: { x: 0, y: 0, width: 110, height: 90, rotation: 0 },
  },
  {
    name: 'Куртка джинсовая',
    category: 'jacket',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
    overlayConfig: { x: 0, y: 0, width: 110, height: 90, rotation: 0 },
  },

  // Брюки
  {
    name: 'Брюки чёрные',
    category: 'pants',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    overlayConfig: { x: 0, y: 20, width: 90, height: 100, rotation: 0 },
  },
  {
    name: 'Джинсы синие',
    category: 'pants',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    overlayConfig: { x: 0, y: 20, width: 90, height: 100, rotation: 0 },
  },

  // Платья
  {
    name: 'Платье красное',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 100, rotation: 0 },
  },
  {
    name: 'Платье чёрное',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    overlayConfig: { x: 0, y: 0, width: 100, height: 100, rotation: 0 },
  },

  // Юбки
  {
    name: 'Юбка мини',
    category: 'skirt',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    overlayConfig: { x: 0, y: 30, width: 80, height: 60, rotation: 0 },
  },
  {
    name: 'Юбка миди',
    category: 'skirt',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    overlayConfig: { x: 0, y: 25, width: 85, height: 70, rotation: 0 },
  },

  // Костюмы
  {
    name: 'Костюм деловой',
    category: 'suit',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
    overlayConfig: { x: 0, y: 0, width: 105, height: 95, rotation: 0 },
  },
  {
    name: 'Костюм casual',
    category: 'suit',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
    overlayConfig: { x: 0, y: 0, width: 105, height: 95, rotation: 0 },
  },
];

async function seedFirestore() {
  console.log('Начинаю загрузку демо-данных...');

  for (const item of CLOTHING_ITEMS) {
    try {
      await addDoc(collection(db, 'clothingItems'), {
        ...item,
        createdAt: Timestamp.now(),
      });
      console.log(`✓ ${item.name} (${item.category})`);
    } catch (error) {
      console.error(`✗ ${item.name}:`, error.message);
    }
  }

  console.log('\nГотово! Загружено', CLOTHING_ITEMS.length, 'товаров.');
}

seedFirestore();
