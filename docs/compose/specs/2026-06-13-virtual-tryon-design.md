# Virtual Try-On MVP — Design Spec

## [S1] Problem

Users want to virtually try on clothing before purchasing. Current solutions require visiting a physical store or guessing sizes/styles from static photos. We need a mobile app that lets users take a photo and see how different clothing items look on them.

## [S2] Solution Overview

A React Native (Expo) mobile app with:
- Camera integration for user photos
- Clothing catalog with categories
- AI-powered body detection and clothing overlay
- Result preview with save/share

**Tech Stack:** Expo SDK 51+, Firebase (Auth, Firestore, Storage), Google Cloud Vision API, react-native-vision-camera, react-native-canvas (overlay rendering)

## [S3] Architecture

### Layers
1. **Presentation** — React Native screens (Expo Router)
2. **State** — React Context + hooks
3. **Services** — Firebase SDK, Vision API client
4. **Data** — Firestore collections, Storage buckets

### Key Components
- `CameraScreen` — live preview, capture photo
- `CatalogScreen` — browse clothing items by category
- `TryOnResultScreen` — overlay clothing on captured photo
- `ClothingCard` — item display component
- `OverlayCanvas` — renders clothing on user photo
- `AuthProvider` — Firebase auth context

## [S4] Data Model

### Firestore Collections

**users/{uid}**
```
uid: string
photoURL: string
createdAt: timestamp
```

**clothingItems/{id}**
```
id: string
name: string
category: 'tshirt' | 'shirt' | 'jacket'
imageUrl: string
overlayConfig: {
  x: number      // % offset from left
  y: number      // % offset from top
  width: number   // % of image width
  height: number  // % of image height
  rotation: number // degrees
}
createdAt: timestamp
```

**tryOnResults/{id}**
```
id: string
userId: string
clothingId: string
originalPhotoUrl: string
resultPhotoUrl: string
createdAt: timestamp
```

## [S5] UI/UX Design

### Style: Fashion E-commerce
- **Theme:** Dark mode (#121212 background)
- **Accent:** Gold (#D4AF37) for CTAs and highlights
- **Typography:** Inter or SF Pro, minimal text
- **Shadows:** Subtle elevation on cards

### Screens

**1. Camera Screen**
- Full-screen camera preview
- Bottom bar: capture button (center), gallery picker (left), flash toggle (right)
- Top bar: minimal, back button + title " примерка"

**2. Catalog Screen**
- Horizontal scroll categories: Футболки | Рубашки | Куртки
- Grid of clothing cards (2 columns)
- Each card: item photo, name, "Примерить" button

**3. Try-On Result Screen**
- Split view or full photo with overlay
- Original photo as base layer
- Clothing item overlaid with correct positioning
- Bottom bar: "Сохранить" | "Поделиться" | "Назад"

## [S6] API Integration

### Google Cloud Vision API
- **Face Detection:** Detect face position and size for overlay positioning
- **Landmark Detection:** Shoulders, neck for clothing placement
- **Endpoint:** `https://vision.googleapis.com/v1/images:annotate`

### Overlay Logic
1. User captures/imports photo
2. Send to Vision API → get face/body bounding box
3. Map clothing overlayConfig to detected body position
4. Render composite on canvas
5. Save result to Firebase Storage

## [S7] Firebase Setup

### Authentication
- Anonymous auth for quick start
- Optional: Google/Apple sign-in for data persistence

### Storage Structure
```
/users/{uid}/profile.jpg
/users/{uid}/results/{resultId}.jpg
/clothing/{itemId}.png
```

### Security Rules
- Users can only read/write their own data
- Clothing items are read-only for all users
- Results stored per-user

## [S8] Error Handling

- Camera permission denied → show settings prompt
- API failure → show retry option, cache last result
- Network offline → queue uploads, show pending state
- Invalid photo → prompt retake with guidance

## [S9] Testing Strategy

- **Unit:** Overlay positioning calculations
- **Integration:** Firebase CRUD operations
- **E2E:** Camera → catalog → try-on → save flow
- **Manual:** Visual quality check on different body types

## [S10] Future Considerations (Out of Scope)

- Hairstyle try-on
- Headwear try-on
- Social sharing / community
- AR live preview (real-time overlay)
- Size recommendation ML
