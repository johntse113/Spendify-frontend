export const COLORS = {
  primary: '#26336D',
  secondary: '#E5E7EB',
  disabled: '#9CA3AF',
  
  text: {
    primary: '#26336D',
    highlight: '#002EFF',
    info: '#3B82F6',
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
  
  header: '#26336D',
  green: '#4CAF50',
} as const;

export type ColorsType = typeof COLORS;