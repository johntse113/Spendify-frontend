# Spendify - your finanical tracker
___
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Automated expense tracking for Hong Kong's digital financial ecosystem. Spendify combines optical character recognition (OCR), machine learning, and budget analytics to help young professionals manage personal finances in a high-cost urban environment.

## Table of Content
___

- [Background](#background)
- [Features](#features)
- [Install](#install)
- [Development](#development)
- [Project Structure](#project-structure)

## Background
___
Hong Kong presents unique financial management challenges for young professionals: high housing costs, frequent small-value transactions across multiple platforms (Octopus, Alipay, credit cards), cultural dining-out habits, and limited financial literacy resources. Existing tools like Planto, gini, and Wallet by BudgetBakers provide partial solutions but rely on manual input or bank data integration—missing the fragmented, cashless transaction patterns common in Hong Kong.

Spendify addresses this gap through:
- Automated receipt scanning using Tesseract OCR to extract transaction details from receipt images
- Smart categorization via machine learning to classify expenses and identify spending patterns
- Real-time budget alerts with predictive analytics to prevent overspending
- Interactive visual reports showing monthly trends, category breakdowns, and spending insights
- Privacy-first architecture processing receipts locally to comply with Hong Kong's Personal Data (Privacy) Ordinance (PDPO)

The application targets Hong Kong's digital-first population with a cross-platform mobile app (iOS/Android) and web interface, enabling instant receipt capture and centralized expense tracking across all transaction platforms.

## Features
___
### Receipt Scanning & OCR
- Real-time receipt capture via mobile camera
- Automated text extraction using Tesseract OCR
- Field extraction: date, amount, merchant, tax, payment method
- Support for thermal and printed receipts
- Preprocessing pipeline: image enhancement, deskewing, noise reduction

### Expense Management
- Automated expense categorization via machine learning
- Manual editing of extracted data for accuracy
- Custom category creation and management
- Transaction history with filtering by date range and category
- Bulk import support for multiple receipts

### Budget Analytics
- Monthly budget target setting with real-time progress tracking
- Budget threshold alerts (warning at 80%, critical at 100%)
- Visual spending dashboard: bar charts, pie charts, trends
- Category-level spending breakdown
- Monthly, quarterly, and yearly comparisons

### User Experience
- Cross-platform support: iOS, Android, and web
- Responsive design optimized for mobile-first interaction
- Dark mode and light mode support
- Bottom navigation for quick access to core features
- Offline capability for receipt scanning (sync on connection)

### Security & Privacy
- Secure authentication via OAuth 2.0 and JWT tokens
- End-to-end encryption for sensitive data transmission
- Local OCR processing—no receipt data sent to external services
- PDPO-compliant data handling
- Role-based access control (RBAC)

## Install
___
### Prerequisites
- Node.js 18+ and npm 9+
- Expo CLI (installed globally or via npx)
- Git for version control
- For Android: Android Studio & Emulator or a physical device with Expo Go app
- For iOS: Xcode & Simulator or a physical device with Expo Go app

### Frontend Setup
1. Clone the repository:
``` bash
git clone https://github.com/johntse113/Spendify-frontend.git
cd Spendify-frontend
```

2. Install dependencies:
``` bash
npm install --legacy-peer-deps
```

3. Start the development server:
``` bash
npm start
```
This opens the Expo Metro bundler. You can then choose to run on Android, iOS, or web.

### Running on Devices/Emulators

**Android:**
``` bash
npm run android
```
Requires Android Studio with an emulator running, or connects via Expo Go app on a physical device.

**iOS:**
``` bash
npm run ios
```
Requires Xcode with a simulator running, or connects via Expo Go app on a physical device.

**Web:**
``` bash
npm run web
```
Opens the app in a web browser on `http://localhost:19006`.

### Troubleshooting
- If you encounter build cache issues, clear the Metro cache: `expo start -c`
- Ensure the backend API is running and accessible at the configured endpoint
- Check Metro logs in the browser console for runtime errors

## Development
___
### Tech Stack
- **Framework:** Expo-managed React Native (SDK 54+)
- **Runtime:** React 19.1.0, React Native 0.81.5
- **Styling:** React Native built-in components
- **Navigation:** Expo Router (file-based routing via `app/` directory)
- **State Management:** React Context API
- **Build Tool:** Metro Bundler (Expo)

### Project Structure
```
app/                          # Expo Router app directory (file-based routing)
├── (auth)/                   # Auth screens (login, register)
├── (tabs)/                   # Tab-based screens (overview, history, scan, menu)
├── components/               # Reusable UI components
├── screens/                  # Additional screen modules (settings, profile, etc.)
├── config/                   # Configuration (API endpoints, etc.)
├── context/                  # React Context (Auth, Settings)
├── hooks/                    # Custom React hooks
└── constant/                 # Constants (colors, fonts, currencies)

assets/                       # Static assets (images, fonts)
```

### Development Commands
- `npm start` — Start Metro bundler
- `npm run android` — Build and run on Android
- `npm run ios` — Build and run on iOS
- `npm run web` — Run on web
- `npm run reset-cache` — Clear Metro cache and restart

## API Integration
___
The frontend communicates with the Spendify backend API. Ensure the backend is running before developing:
- Backend API Base URL: `http://localhost:8080/` (default)
- Update the API endpoint in `app/config/api.tsx` as needed

### Key Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Fetch user profile
- Transaction and budget management endpoints (backend documentation)

## Building for Production
___
### EAS Build (Recommended for Expo projects)
1. Install EAS CLI:
``` bash
npm install -g eas-cli
```

2. Configure EAS in your project:
``` bash
eas build:configure
```

3. Build for iOS and Android:
``` bash
eas build --platform ios
eas build --platform android
```

### Web Deployment
For web deployment, build the static bundle:
``` bash
npm run web -- --no-dev
```
Then deploy the output to your hosting provider.

## Contributing
___
- Create a feature branch: `git checkout -b feature/your-feature`
- Make incremental commits with clear messages
- Test on both Android and iOS before submitting a PR
- Include a description of manual testing steps in your PR

## Additional Resources
___
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Spendify Backend Repository](https://github.com/Maulei41/Spendify)




