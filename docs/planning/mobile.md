# Mobile strategy: iOS + Android

The app is web-based today but needs to ship as a real app on the **Android and iOS
stores**. The author is a web developer with no native-app experience (beyond QA). This
doc is the plan that gets there without learning a native stack.

## Approach: Capacitor (one Vue codebase → web + iOS + Android)

[Capacitor](https://capacitorjs.com) wraps the existing Vue app in a thin native shell:
the app runs in a full-screen system WebView, and Capacitor bridges it to native
features (audio, storage, lifecycle, notifications, haptics). You keep writing the Vue
app you already know; the "app" is that Vue app in a native container. **The same source
produces the website and both store apps.**

### Why this is the right call for a web dev

- Reuses 100% of the Vue/Vite/Vuetify code. No new language or framework.
- Produces real Xcode and Android Studio projects → genuine App Store / Play Store apps.
- Pairs perfectly with the backend-ready plan (`vision.md`): one API later serves web +
  iOS + Android identically, no per-platform rework.
- Escape hatch: if a specific need ever outgrows the WebView, individual native plugins
  (or a later native rewrite of one screen) are possible, but unlikely to be needed.

### Alternatives considered (and why not)

- **PWA (installable web app)**: no app-store presence and iOS restricts PWAs heavily.
  The requirement is "an app on Android and iOS", so this is out.
- **React Native / Flutter / native Swift + Kotlin**: throw away the Vue app and learn a
  new stack. No benefit here that justifies the cost.

## The honest learning curve

The **code** barely changes. The new/occasionally-painful parts are the native
toolchains and the stores: tooling and process, not programming:

- **Xcode** (macOS only; the author has a Mac) to build/sign/run iOS.
- **Android Studio** to build/run Android.
- **CocoaPods** (iOS dependency manager Capacitor uses).
- **Accounts**: Apple Developer Program (**$99/year**) and Google Play Console
  (**$25 one-time**).
- **Store submission**: Apple review is stricter/slower; Google is faster. Each store has
  its own metadata, screenshots, privacy disclosures, and signing setup.

This is a one-time hump (provisioning, signing, first submission), not ongoing work.

## What changes in the app

- **Storage**: swap `localStorage` for `@capacitor/preferences` behind the existing
  storage layer (the `storage.js` abstraction already isolates this).
- **Lifecycle**: `@capacitor/app` for pause/resume (useful for session timing and any
  future idle logic).
- **Metronome audio**: decide **keep-screen-awake vs true background audio**: a
  metronome ideally keeps ticking with the screen locked, which needs the iOS audio
  background mode; keep-awake is the simpler MVP. (Carried over from the archived
  `archive/01-platform-setup.md`.)
- **Mobile UX**: safe-area insets (notches), touch-target sizes, and verifying the audio
  engine's timing holds up in a real device WebView (test at high BPM for several minutes).

## Prerequisites checklist

- [ ] Mac with Xcode installed (iOS): ✓ available.
- [ ] Android Studio installed (Android).
- [ ] CocoaPods installed.
- [ ] Apple Developer Program membership ($99/yr): needed for device testing + App Store.
- [ ] Google Play Console account ($25 one-time).

## Rough setup (when the time comes)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/ios @capacitor/android
npm run build
npx cap add ios && npx cap add android
# iterate:
npm run build && npx cap sync && npx cap open ios   # or: open android
```

## Sequencing

- **Not yet.** Do this once there's enough app to be worth installing, i.e. after the
  roadmap's *Next* block (stepped-tempo runner, presets, logging). Shipping a thin app
  now wastes the store-setup effort.
- **Android first** is the cheaper/faster target ($25, quick review) to validate on real
  devices; **iOS** follows (Mac + $99/yr + stricter review).
- **Optional early step**: stand up the Capacitor shell sooner *just for on-device
  testing* as you build. It's low cost, and it surfaces mobile issues early. Store submission
  still waits.

## Risks

- **Audio timing in a WebView**: the biggest unknown; mitigated by the look-ahead
  scheduler already built, but must be verified on a real device.
- **Store review**: low risk for a practice app, but any future accounts/IAP raise the bar.
- **First-time toolchain friction**: budget time for signing/provisioning the first run.
