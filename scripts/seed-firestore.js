const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Load .env manually
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

console.log('Firebase config:', { projectId: firebaseConfig.projectId, apiKey: firebaseConfig.apiKey ? 'set' : 'missing' });

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOTHING_ITEMS = [
  { name: 'Футболка белая', category: 'tshirt', imageUrl: 'tshirt_white', width: 100, height: 80 },
  { name: 'Футболка чёрная', category: 'tshirt', imageUrl: 'tshirt_black', width: 100, height: 80 },
  { name: 'Рубашка голубая', category: 'shirt', imageUrl: 'shirt_blue', width: 100, height: 85 },
  { name: 'Куртка кожаная', category: 'jacket', imageUrl: 'jacket_leather', width: 110, height: 90 },
  { name: 'Брюки чёрные', category: 'pants', imageUrl: 'pants_black', width: 90, height: 100 },
  { name: 'Платье красное', category: 'dress', imageUrl: 'dress_red', width: 100, height: 100 },
  { name: 'Юбка мини', category: 'skirt', imageUrl: 'skirt_mini', width: 80, height: 60 },
  { name: 'Костюм деловой', category: 'suit', imageUrl: 'suit_formal', width: 105, height: 95 },
];

async function seedFirestore() {
  console.log('Starting seed...');

  for (const item of CLOTHING_ITEMS) {
    try {
      await addDoc(collection(db, 'clothingItems'), {
        name: item.name,
        category: item.category,
        imageUrl: item.imageUrl,
        overlayConfig: {
          x: 0,
          y: 0,
          width: item.width,
          height: item.height,
          rotation: 0,
        },
        createdAt: Timestamp.now(),
      });
      console.log('Added:', item.name);
    } catch (error) {
      console.error('Failed:', item.name, error.message);
    }
  }

  console.log('Done!');
}

seedFirestore();
