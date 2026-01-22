export const FONTS = {
  primaryBold: {
    family: 'RobotoMono-Bold',
    path: '../../assets/fonts/Roboto_Mono/static/RobotoMono-Bold.ttf',
  },
  primary: {
    family: 'RobotoMono-Regular',
    path: '../../assets/fonts/Roboto_Mono/static/RobotoMono-Regular.ttf',
  },
  secondary: {
    family: 'Poppins-Medium',
    path: '../../assets/fonts/Poppins/Poppins-Medium.ttf',
  },
  secondaryBold: {
    family: 'Poppins-Bold',
    path: '../../assets/fonts/Poppins/Poppins-Bold.ttf',
  },
} as const;

export type FontKeys = keyof typeof FONTS;