export const COLORS = {
  primary: '#141E4E',
  secondary: '#E5E7EB',
  
  text: {
    primary: '#141E4E',
    secondary: '#6B7280',
    light: '#FFFFFF',
    error: '#DC2626',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    dark: '#141E4E',
  },
  
  border: '#E5E7EB',
  success: '#4CAF50',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  header: '#141E4E',
  green: '#4CAF50',
} as const;

export type ColorsType = typeof COLORS;