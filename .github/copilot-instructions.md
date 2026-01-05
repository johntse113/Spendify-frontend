# AI Agent Instructions for spendify-mobile

## Purpose
Short, actionable guidance so an AI coding agent can be immediately productive in this repository.

## Project at a glance ✅
- Expo-managed React Native app (Expo SDK ~54). Key runtime versions are in `package.json` (react 19.1.0, react-native 0.81.5).
- App entry point: `App.js` (Expo uses this file). There is a sample screen at `app/index.jsx`.
- Static assets (icons, splash) live in `assets/` and referenced from `app.json`.

## How to run locally 🔧
- Install dependencies: `npm install`
- Start Metro/Expo: `npm start` (alias for `expo start`)
- Open on Android: `npm run android` (starts Expo and opens on device/emulator via Expo Go)
- Open on iOS: `npm run ios` (same for iOS/simulator)
- Web: `npm run web`
- Useful: use `expo start -c` to clear Metro cache when debugging odd behaviour.

## Build / native changes notes ⚠️
- This is an *Expo-managed* project. If adding native modules, the developer will need to run an Expo prebuild step or migrate to a custom workflow (not currently present in repo).
- There is no CI or test harness present in the repo; changes must be validated by running the app locally.

## Key files & patterns (reference) 🔍
- `App.js` — root component and default Expo entrypoint. Use this as the integration point for screens/navigation.
- `app/index.jsx` — example screen (not automatically wired into `App.js`). Note: this file currently uses lowercase JSX tags (`<view>`, `<text>`) which will cause runtime errors; use `View` and `Text` imported from `react-native`.
  - Example fix: replace `<view>` with `<View>` and `<text>` with `<Text>` and ensure `import { View, Text } from 'react-native'`.
- `app.json` — Expo configuration (icons, splash, platform options).
- `assets/` — images referenced by `app.json`. Keep paths in `app.json` synchronized with this folder.
- `package.json` — scripts to run app (`start`, `android`, `ios`, `web`) and the dependency list.

## Common troubleshooting / debugging tips 💡
- Runtime UI errors commonly show in Metro / Expo logs; open the Metro console in the browser that `expo start` opens.
- For native logs on Android, use `adb logcat` if deeper debugging is needed.
- If changes to images or native assets don't appear, try `expo start -c` to clear cache.

## Conventions / expectations
- Plain JavaScript + JSX (no TypeScript present).
- No test or lint configuration exists yet; assume manual checks are required when modifying behavior or UI.

## What NOT to assume
- There are no server/API clients or environment variable files in the repo. Search the codebase first for `fetch`, `axios`, or config files before adding integrations.
- The `app/` folder is small and currently contains only example UI; navigation or routing libraries are not preinstalled.

## PR guidance for AI agents ✍️
- Make small, incremental changes and run the app locally after each change.
- Include a short note in the PR describing manual steps you used to validate the change (simulator used, commands run).
- When touching `app.json` or assets, verify the app still boots and assets display correctly on device/emulator.

---
If any section is unclear or you'd like more detailed guidance (eg. navigation conventions to adopt, or testing setup), tell me what to expand and I will iterate.