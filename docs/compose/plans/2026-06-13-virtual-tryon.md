# Virtual Try-On MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native (Expo) mobile app that lets users take a photo and virtually try on clothing items.

**Architecture:** Expo Router for navigation, Firebase for auth/storage/DB, Google Cloud Vision API for body detection, canvas overlay for rendering clothing on user photos.

**Tech Stack:** Expo SDK 51+, TypeScript, Firebase (Auth, Firestore, Storage), Google Cloud Vision API, react-native-vision-camera, expo-image-picker, react-native-canvas

---

## File Structure

```
project/
├── app/
│   ├── _layout.tsx              # Root layout with AuthProvider
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigator
│       ├── camera.tsx           # Camera screen
│       ├── catalog.tsx          # Clothing catalog screen
│       └── results.tsx          # Try-on result screen
├── components/
│   ├── CameraView.tsx           # Camera preview component
│   ├── ClothingCard.tsx         # Single clothing item card
│   ├── OverlayCanvas.tsx        # Canvas overlay for try-on
│   └── CategoryTabs.tsx         # Horizontal category selector
├── services/
│   ├── firebase.ts              # Firebase config & init
│   ├── auth.ts                  # Anonymous authentication
│   ├── storage.ts               # Firebase Storage helpers
│   ├── firestore.ts             # Firestore CRUD operations
│   └── visionApi.ts             # Google Vision API client
├── hooks/
│   ├── useCamera.ts             # Camera permissions & capture
│   ├── useClothing.ts           # Clothing items data hook
│   └── useTryOn.ts              # Try-on flow orchestration
├── utils/
│   ├── overlay.ts               # Overlay positioning math
│   └── constants.ts             # Theme, colors, config
├── types/
│   └── index.ts                 # TypeScript type definitions
├── assets/
│   └── images/                  # App icons, placeholders
├── app.json                     # Expo config
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Scaffolding & Dependencies

**Covers:** [S2]

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `types/index.ts`
- Create: `utils/constants.ts`

- [ ] **Step 1: Initialize Expo project**

```bash
cd C:\MIMO\project
npx create-expo-app@latest . --template blank-typescript
```

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-router expo-image-picker expo-camera expo-media-library
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install firebase react-native-canvas
npx expo install @expo/vector-icons expo-font
```

- [ ] **Step 3: Create TypeScript types**

```typescript
// types/index.ts
export interface User {
  uid: string;
  photoURL: string;
  createdAt: Date;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: 'tshirt' | 'shirt' | 'jacket';
  imageUrl: string;
  overlayConfig: OverlayConfig;
  createdAt: Date;
}

export interface OverlayConfig {
  x: number;      // % offset from left
  y: number;      // % offset from top
  width: number;   // % of image width
  height: number;  // % of image height
  rotation: number; // degrees
}

export interface TryOnResult {
  id: string;
  userId: string;
  clothingId: string;
  originalPhotoUrl: string;
  resultPhotoUrl: string;
  createdAt: Date;
}

export interface BodyDetection {
  faceBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  shoulderWidth: number;
  confidence: number;
}
```

- [ ] **Step 4: Create theme constants**

```typescript
// utils/constants.ts
export const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2A2A2A',
  accent: '#D4AF37',
  accentDark: '#B8960C',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  error: '#FF6B6B',
  success: '#4ECB71',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const CATEGORIES = [
  { id: 'tshirt', label: 'Футболки' },
  { id: 'shirt', label: 'Рубашки' },
  { id: 'jacket', label: 'Куртки' },
] as const;
```

- [ ] **Step 5: Configure app.json**

```json
{
  "expo": {
    "name": "Virtual Try-On",
    "slug": "virtual-tryon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "backgroundColor": "#121212"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.virtualtryon.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#121212"
      },
      "package": "com.virtualtryon.app"
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Virtual Try-On to access your camera for virtual try-on."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Virtual Try-On to access your photos for virtual try-on."
        }
      ]
    ]
  }
}
```

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Expo project with types and theme"
```

---

## Task 2: Firebase Configuration & Auth

**Covers:** [S7]

**Files:**
- Create: `services/firebase.ts`
- Create: `services/auth.ts`
- Create: `app/_layout.tsx`

- [ ] **Step 1: Create Firebase config**

```typescript
// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getReactNativeAsyncStoragePersistence } from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativeAsyncStoragePersistence(),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
```

- [ ] **Step 2: Create auth service**

```typescript
// services/auth.ts
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
```

- [ ] **Step 3: Create root layout with auth**

```tsx
// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { initAuth } from '../services/auth';
import { COLORS } from '../utils/constants';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAuth().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add services/firebase.ts services/auth.ts app/_layout.tsx
git commit -m "feat: add Firebase config and anonymous auth"
```

---

## Task 3: Firestore & Storage Services

**Covers:** [S4], [S7]

**Files:**
- Create: `services/firestore.ts`
- Create: `services/storage.ts`

- [ ] **Step 1: Create Firestore service**

```typescript
// services/firestore.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
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
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, CLOTHING_COLLECTION), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as ClothingItem[];
}

export async function getClothingItem(id: string): Promise<ClothingItem | null> {
  const docRef = doc(db, CLOTHING_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
  } as ClothingItem;
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
```

- [ ] **Step 2: Create Storage service**

```typescript
// services/storage.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add services/firestore.ts services/storage.ts
git commit -m "feat: add Firestore and Storage services"
```

---

## Task 4: Google Cloud Vision API Service

**Covers:** [S6]

**Files:**
- Create: `services/visionApi.ts`
- Create: `utils/overlay.ts`

- [ ] **Step 1: Create Vision API service**

```typescript
// services/visionApi.ts
import { BodyDetection } from '../types';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;

interface VisionResponse {
  responses: Array<{
    faceAnnotations?: Array<{
      boundingPoly: {
        vertices: Array<{ x: number; y: number }>;
      };
      detectionConfidence: number;
    }>;
  }>;
}

export async function detectBody(imageBase64: string): Promise<BodyDetection | null> {
  const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: 'FACE_DETECTION', maxResults: 1 },
          ],
        },
      ],
    }),
  });

  const data: VisionResponse = await response.json();
  const face = data.responses[0]?.faceAnnotations?.[0];

  if (!face) return null;

  const vertices = face.boundingPoly.vertices;
  const x = Math.min(...vertices.map((v) => v.x));
  const y = Math.min(...vertices.map((v) => v.y));
  const maxX = Math.max(...vertices.map((v) => v.x));
  const maxY = Math.max(...vertices.map((v) => v.y));

  return {
    faceBounds: {
      x,
      y,
      width: maxX - x,
      height: maxY - y,
    },
    shoulderWidth: (maxX - x) * 2.5,
    confidence: face.detectionConfidence,
  };
}

export async function imageToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

- [ ] **Step 2: Create overlay utilities**

```typescript
// utils/overlay.ts
import { BodyDetection, OverlayConfig } from '../types';

export interface OverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export function calculateOverlayPosition(
  body: BodyDetection,
  config: OverlayConfig,
  imageWidth: number,
  imageHeight: number
): OverlayPosition {
  const { faceBounds, shoulderWidth } = body;

  const centerX = faceBounds.x + faceBounds.width / 2;
  const shoulderY = faceBounds.y + faceBounds.height * 1.8;

  const width = shoulderWidth * (config.width / 100);
  const height = width * (config.height / config.width);

  const x = centerX - width / 2 + (config.x / 100) * width;
  const y = shoulderY - height * (config.y / 100);

  return {
    x: Math.max(0, Math.min(x, imageWidth - width)),
    y: Math.max(0, Math.min(y, imageHeight - height)),
    width,
    height,
    rotation: config.rotation,
  };
}

export function isOverlayValid(
  position: OverlayPosition,
  imageWidth: number,
  imageHeight: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= imageWidth &&
    position.y + position.height <= imageHeight &&
    position.width > 0 &&
    position.height > 0
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add services/visionApi.ts utils/overlay.ts
git commit -m "feat: add Vision API client and overlay positioning"
```

---

## Task 5: Camera Hook & Component

**Covers:** [S5], [S8]

**Files:**
- Create: `hooks/useCamera.ts`
- Create: `components/CameraView.tsx`

- [ ] **Step 1: Create camera hook**

```typescript
// hooks/useCamera.ts
import { useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<Camera.FlashMode>('off');
  const cameraRef = useRef<Camera>(null);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
        'Доступ к камере',
        'Для работы приложения нужен доступ к камере. Перейдите в настройки.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Настройки', onPress: () => Camera.requestCameraPermissionsAsync() },
        ]
      );
    }

    return status === 'granted';
  };

  const takePhoto = async (): Promise<string | null> => {
    if (!cameraRef.current) return null;

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setPhoto(result.uri);
      return result.uri;
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото. Попробуйте ещё раз.');
      return null;
    }
  };

  const pickFromGallery = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Доступ к галерее', 'Нужен доступ к галерее для выбора фото.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;

    setPhoto(result.assets[0].uri);
    return result.assets[0].uri;
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const clearPhoto = () => setPhoto(null);

  return {
    hasPermission,
    photo,
    flashMode,
    cameraRef,
    requestPermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
    clearPhoto,
  };
}
```

- [ ] **Step 2: Create CameraView component**

```tsx
// components/CameraView.tsx
import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';

interface CameraViewProps {
  cameraRef: React.RefObject<Camera>;
  flashMode: 'on' | 'off';
  onCapture: () => void;
  onPickGallery: () => void;
  onToggleFlash: () => void;
}

export function CameraView({
  cameraRef,
  flashMode,
  onCapture,
  onPickGallery,
  onToggleFlash,
}: CameraViewProps) {
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        flashMode={flashMode}
        type={Camera.Constants.Type.back}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onToggleFlash} style={styles.iconButton}>
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-outline'}
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={onPickGallery} style={styles.iconButton}>
              <Ionicons name="images-outline" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onCapture} style={styles.captureButton}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={{ width: 48 }} />
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.textPrimary,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useCamera.ts components/CameraView.tsx
git commit -m "feat: add camera hook and component"
```

---

## Task 6: Clothing Catalog Hook & Components

**Covers:** [S4], [S5]

**Files:**
- Create: `hooks/useClothing.ts`
- Create: `components/ClothingCard.tsx`
- Create: `components/CategoryTabs.tsx`

- [ ] **Step 1: Create clothing hook**

```typescript
// hooks/useClothing.ts
import { useState, useEffect } from 'react';
import { getClothingItems } from '../services/firestore';
import { ClothingItem } from '../types';

export function useClothing() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getClothingItems(selectedCategory ?? undefined);
      setItems(data);
    } catch (err) {
      setError('Не удалось загрузить каталог');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  return {
    items,
    loading,
    error,
    selectedCategory,
    selectCategory,
    refresh: loadItems,
  };
}
```

- [ ] **Step 2: Create CategoryTabs component**

```tsx
// components/CategoryTabs.tsx
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, CATEGORIES } from '../utils/constants';

interface CategoryTabsProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.tab, !selected && styles.tabActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.tabText, !selected && styles.tabTextActive]}>
          Все
        </Text>
      </TouchableOpacity>

      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.tab, selected === cat.id && styles.tabActive]}
          onPress={() => onSelect(cat.id)}
        >
          <Text
            style={[
              styles.tabText,
              selected === cat.id && styles.tabTextActive,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.background,
  },
});
```

- [ ] **Step 3: Create ClothingCard component**

```tsx
// components/ClothingCard.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ClothingItem } from '../types';
import { COLORS, SPACING, SHADOWS } from '../utils/constants';

interface ClothingCardProps {
  item: ClothingItem;
  onTryOn: (item: ClothingItem) => void;
}

export function ClothingCard({ item, onTryOn }: ClothingCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onTryOn(item)}
        >
          <Text style={styles.buttonText}>Примерить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  info: {
    padding: SPACING.sm,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add hooks/useClothing.ts components/CategoryTabs.tsx components/ClothingCard.tsx
git commit -m "feat: add clothing catalog components"
```

---

## Task 7: Try-On Hook & Overlay Canvas

**Covers:** [S3], [S6]

**Files:**
- Create: `hooks/useTryOn.ts`
- Create: `components/OverlayCanvas.tsx`

- [ ] **Step 1: Create try-on hook**

```typescript
// hooks/useTryOn.ts
import { useState } from 'react';
import { detectBody, imageToBase64 } from '../services/visionApi';
import { calculateOverlayPosition, isOverlayValid } from '../utils/overlay';
import { BodyDetection, ClothingItem, OverlayPosition } from '../types';

interface TryOnState {
  loading: boolean;
  error: string | null;
  body: BodyDetection | null;
  position: OverlayPosition | null;
}

export function useTryOn() {
  const [state, setState] = useState<TryOnState>({
    loading: false,
    error: null,
    body: null,
    position: null,
  });

  const processPhoto = async (
    photoUri: string,
    clothing: ClothingItem
  ): Promise<boolean> => {
    setState({ loading: true, error: null, body: null, position: null });

    try {
      const base64 = await imageToBase64(photoUri);
      const body = await detectBody(base64);

      if (!body) {
        setState({
          loading: false,
          error: 'Не удалось обнаружить лицо. Попробуйте другое фото.',
          body: null,
          position: null,
        });
        return false;
      }

      if (body.confidence < 0.5) {
        setState({
          loading: false,
          error: 'Низкое качество распознавания. Попробуйте фото при хорошем освещении.',
          body,
          position: null,
        });
        return false;
      }

      const position = calculateOverlayPosition(
        body,
        clothing.overlayConfig,
        1000,
        1000
      );

      if (!isOverlayValid(position, 1000, 1000)) {
        setState({
          loading: false,
          error: 'Не удалось корректно разместить одежду.',
          body,
          position: null,
        });
        return false;
      }

      setState({ loading: false, error: null, body, position });
      return true;
    } catch (err) {
      setState({
        loading: false,
        error: 'Ошибка обработки фото. Проверьте соединение.',
        body: null,
        position: null,
      });
      return false;
    }
  };

  const reset = () => {
    setState({ loading: false, error: null, body: null, position: null });
  };

  return {
    ...state,
    processPhoto,
    reset,
  };
}
```

- [ ] **Step 2: Create OverlayCanvas component**

```tsx
// components/OverlayCanvas.tsx
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { OverlayPosition } from '../types';
import { COLORS } from '../utils/constants';

interface OverlayCanvasProps {
  photoUri: string;
  clothingImageUrl: string;
  position: OverlayPosition | null;
  loading?: boolean;
}

export function OverlayCanvas({
  photoUri,
  clothingImageUrl,
  position,
  loading = false,
}: OverlayCanvasProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />

      {position && (
        <Image
          source={{ uri: clothingImageUrl }}
          style={[
            styles.clothing,
            {
              left: `${position.x / 10}%`,
              top: `${position.y / 10}%`,
              width: `${position.width / 10}%`,
              height: `${position.height / 10}%`,
              transform: [{ rotate: `${position.rotation}deg` }],
            },
          ]}
          resizeMode="contain"
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  clothing: {
    position: 'absolute',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useTryOn.ts components/OverlayCanvas.tsx
git commit -m "feat: add try-on hook and overlay canvas"
```

---

## Task 8: Camera Screen

**Covers:** [S5]

**Files:**
- Create: `app/(tabs)/camera.tsx`

- [ ] **Step 1: Create camera screen**

```tsx
// app/(tabs)/camera.tsx
import { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '../../components/CameraView';
import { useCamera } from '../../hooks/useCamera';
import { COLORS } from '../../utils/constants';

export default function CameraScreen() {
  const router = useRouter();
  const {
    hasPermission,
    flashMode,
    cameraRef,
    requestPermission,
    takePhoto,
    pickFromGallery,
    toggleFlash,
  } = useCamera();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleCapture = async () => {
    const uri = await takePhoto();
    if (uri) {
      router.push({ pathname: '/catalog', params: { photoUri: uri } });
    }
  };

  const handlePickGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) {
      router.push({ pathname: '/catalog', params: { photoUri: uri } });
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    Alert.alert(
      'Нет доступа',
      'Разрешите доступ к камере в настройках устройства'
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        cameraRef={cameraRef}
        flashMode={flashMode}
        onCapture={handleCapture}
        onPickGallery={handlePickGallery}
        onToggleFlash={toggleFlash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/camera.tsx
git commit -m "feat: add camera screen"
```

---

## Task 9: Catalog Screen

**Covers:** [S5]

**Files:**
- Create: `app/(tabs)/catalog.tsx`

- [ ] **Step 1: Create catalog screen**

```tsx
// app/(tabs)/catalog.tsx
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ClothingCard } from '../../components/ClothingCard';
import { useClothing } from '../../hooks/useClothing';
import { COLORS, SPACING } from '../../utils/constants';
import { ClothingItem } from '../../types';

export default function CatalogScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();
  const { items, loading, error, selectedCategory, selectCategory } = useClothing();

  const handleTryOn = (item: ClothingItem) => {
    router.push({
      pathname: '/results',
      params: { photoUri, clothingId: item.id },
    });
  };

  return (
    <View style={styles.container}>
      <CategoryTabs selected={selectedCategory} onSelect={selectCategory} />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ClothingCard item={item} onTryOn={handleTryOn} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  list: {
    padding: SPACING.sm,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/catalog.tsx
git commit -m "feat: add catalog screen"
```

---

## Task 10: Results Screen

**Covers:** [S5]

**Files:**
- Create: `app/(tabs)/results.tsx`

- [ ] **Step 1: Create results screen**

```tsx
// app/(tabs)/results.tsx
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OverlayCanvas } from '../../components/OverlayCanvas';
import { useTryOn } from '../../hooks/useTryOn';
import { getClothingItem } from '../../services/firestore';
import { saveTryOnResult } from '../../services/firestore';
import { uploadTryOnResult } from '../../services/storage';
import { initAuth } from '../../services/auth';
import { COLORS, SPACING } from '../../utils/constants';
import { ClothingItem } from '../../types';

export default function ResultsScreen() {
  const { photoUri, clothingId } = useLocalSearchParams<{
    photoUri: string;
    clothingId: string;
  }>();
  const router = useRouter();
  const { loading, error, position, processPhoto, reset } = useTryOn();
  const [clothing, setClothing] = useState<ClothingItem | null>(null);

  useEffect(() => {
    loadClothing();
  }, [clothingId]);

  useEffect(() => {
    if (clothing && photoUri) {
      processPhoto(photoUri, clothing);
    }
  }, [clothing, photoUri]);

  const loadClothing = async () => {
    const item = await getClothingItem(clothingId);
    setClothing(item);
  };

  const handleSave = async () => {
    try {
      const user = await initAuth();
      const resultId = Date.now().toString();
      const resultUrl = await uploadTryOnResult(user.uid, resultId, photoUri);
      await saveTryOnResult(user.uid, clothingId, photoUri, resultUrl);
      Alert.alert('Сохранено', 'Результат сохранён в вашем профиле');
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось сохранить результат');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Посмотри, как мне идёт эта одежда! 👗',
        url: photoUri,
      });
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  const handleBack = () => {
    reset();
    router.back();
  };

  return (
    <View style={styles.container}>
      <OverlayCanvas
        photoUri={photoUri}
        clothingImageUrl={clothing?.imageUrl ?? ''}
        position={position}
        loading={loading}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Поделиться</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
        >
          <Ionicons name="bookmark-outline" size={24} color={COLORS.background} />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: COLORS.background,
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  retryText: {
    color: COLORS.accent,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/results.tsx
git commit -m "feat: add try-on results screen"
```

---

## Task 11: Tab Navigator & Final Polish

**Covers:** [S5]

**Files:**
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create tab layout**

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Камера',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Каталог',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Результат',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="image" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: add tab navigator layout"
```

---

## Task 12: Environment Config & Documentation

**Covers:** [S7]

**Files:**
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Create .env.example**

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=
```

- [ ] **Step 2: Update .gitignore**

```
node_modules/
.env
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
```

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add env config and gitignore"
```

---

## Summary

| Task | Description | Spec Coverage |
|------|-------------|---------------|
| 1 | Project scaffolding | S2 |
| 2 | Firebase auth | S7 |
| 3 | Firestore & Storage | S4, S7 |
| 4 | Vision API | S6 |
| 5 | Camera hook & component | S5, S8 |
| 6 | Catalog components | S4, S5 |
| 7 | Try-on hook & overlay | S3, S6 |
| 8 | Camera screen | S5 |
| 9 | Catalog screen | S5 |
| 10 | Results screen | S5 |
| 11 | Tab navigator | S5 |
| 12 | Config & docs | S7 |
