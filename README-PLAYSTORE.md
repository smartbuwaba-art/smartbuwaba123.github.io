# SMART BUWABA TV — Android Play Store project

This is an Android Studio project that wraps the live Smart Buwaba TV site:
https://smartbuwaba-art.github.io/smartbuwaba123.github.io/

It enables:
- JavaScript + Firebase web features
- Android file picker for photo/video uploads
- Camera/microphone permission handling for browser camera features
- Standalone Android app packaging

## Build an AAB
1. Open this folder in Android Studio.
2. Let Gradle sync/download the Android Gradle Plugin.
3. Build > Generate Signed Bundle / APK.
4. Select Android App Bundle (AAB).
5. Create/select your release keystore and build the release AAB.
6. Upload the AAB to Google Play Console.

## Important
The current project points to the live website. Your Firebase rules, authentication, Storage, chat, AI backend, and web features must be configured on the website/Firebase side.

Do NOT put private API keys or service-account credentials into the Android app.
