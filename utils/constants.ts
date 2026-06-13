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
