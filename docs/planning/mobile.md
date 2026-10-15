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

- **Storage**: ready. `storage.js` reads and writes through an async adapter, and
  progress loads before the app mounts. On native, call `setStorageAdapter(...)` at
  startup with a native adapter. Pick the store with data size in mind:
  `@capacitor/preferences` is meant for small key-value settings, but the save blob grows
  with every logged session, so a JSON file via `@capacitor/filesystem` (or SQLite later)
  is likely the better fit. On first native launch, copy any existing WebView
  `localStorage` data into the native store (one-time migration).
- **Lifecycle**: `@capacitor/app` for pause/resume (useful for session timing and any
  future idle logic).
- **Metronome audio**: decide **keep-screen-awake vs true background audio**: a
  metronome ideally keeps ticking with the screen locked, which needs the iOS audio
  background mode; keep-awake is the simpler MVP. (Carried over from the archived
  `archive/01-platform-setup.md`.)
- **Mobile UX**: safe-area insets (notches), touch-target sizes, and verifying the audio
  engine's timing holds up in a real device WebView (test at high BPM for several minutes).

## Prerequisites checklist

- [x] Mac with Xcode installed and selected (`sudo xcode-select -s
  /Applications/Xcode.app/Contents/Developer`, licence accepted, `xcodebuild
  -runFirstLaunch`). Currently Xcode 16.4 with the iOS 18.5 simulator.
- [x] ~~CocoaPods~~ Not needed: the iOS project uses Swift Package Manager.
- [ ] Android Studio installed (Android).
- [ ] Apple Developer Program membership ($99/yr): only needed for TestFlight and the
  App Store. A free Apple ID is enough to run the app on your own iPhone (those builds
  expire after 7 days; re-run from Xcode to refresh).
- [ ] Google Play Console account ($25 one-time).

## iOS: what's set up

- Capacitor 8 with an Xcode project in `ios/` (Swift Package Manager, no CocoaPods).
- App ID `com.michaelsheridan.gamifiedmetronome` and name "Gamified Metronome", both
  placeholders until the app is named (the ID only becomes permanent on App Store release).
- Safe areas: the page draws edge to edge (`viewport-fit=cover` in `index.html`) and the
  app bar, content, bottom tab bar, and full-screen dialogs are padded by the device's
  insets (`env(safe-area-inset-*)` in `App.vue`). The app bar's blue extends behind the
  status bar. (`ios.contentInset` was tried first but left fixed bottom bars under the
  home indicator.)
- Phones get a bottom tab bar (icon + label); larger screens keep the top tabs.
- Verified in the iPhone 16 simulator (iOS 18.5): the app runs, onboarding and the main
  tabs render, and saved data survives a force-quit and relaunch.

### Day-to-day workflow

After changing the web app, rebuild and copy it into the iOS project, then open Xcode:

```bash
npm run ios
```

That runs `vite build && cap sync ios && cap open ios`. From Xcode, pick a simulator or
your iPhone and press Run.

Write code in your editor and use Xcode only to run the app and change native settings.
Don't edit `App/App/public` in Xcode: it's a generated copy of the build and is
overwritten on every sync.

### Live reload on the phone

```bash
npm run ios:live
```

This builds and syncs, then starts the dev server on your local network and points the
iOS app at it. Press Run in Xcode once; after that, saving a file updates the phone in a
second or two.

- The phone must be on the same Wi-Fi as the Mac. The first time, iOS asks to allow
  access to devices on your local network: allow it.
- Ctrl+C stops the server and points the app back at the built files. Press Run again
  afterwards, or the app on the phone keeps looking for the dev server and shows a blank
  screen.
- The phone loads the app over plain `http`, not as a bundled app, so a few browser
  features may behave differently. Test audio behaviour (e.g. the silent switch) with a
  normal Run.

### Running on your own iPhone (free Apple ID)

1. Plug the iPhone into the Mac, unlock it, and tap **Trust This Computer**.
2. In Xcode (`npm run ios`), select the **App** target, then **Signing & Capabilities**.
   Under **Team**, add your Apple ID and choose your **Personal Team**.
3. Choose your iPhone as the run destination at the top of the window and press **Run**.
4. On the iPhone, turn on **Developer Mode** when asked (Settings > Privacy & Security >
   Developer Mode; it restarts the phone), then run again.
5. The first time, iOS blocks the app as from an "untrusted developer": go to Settings >
   General > VPN & Device Management, trust your Apple ID, and open the app.

### Mobile polish (not done yet)

- ~~Status bar area~~ Done: the app bar's blue extends behind the status bar.
- ~~Navigation~~ Done: bottom tab bar on phones.
- ~~Silent switch~~ Done: the web audio session is set to `playback`
  (`navigator.audioSession`), so the metronome plays with the ring/silent switch on.
- **Mix with other apps**: `playback` may still pause music from another app. To play
  along to it, set `AVAudioSession` `.playback` with `.mixWithOthers` natively (a few
  lines in `AppDelegate.swift`). Test on a device.
- **Keep the screen awake** during practice (keep-awake plugin).
- **Native storage adapter** (see "What changes in the app" above), plus a one-time
  migration from WebView `localStorage`.
- **App icon and launch screen**: currently Capacitor's placeholders; they need
  human-designed artwork (no AI visuals).

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
