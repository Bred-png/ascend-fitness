# Shipping Reborn to your iPhone

The web app keeps working exactly as-is. These steps wrap it as a native iOS app so
Apple Health and local notifications work.

## 1. Get the code on your Mac

1. In Lovable, use **GitHub → Export to GitHub**, then `git clone` your repo.
2. `npm install`

## 2. Add the iOS project

```bash
npm install @capacitor/cli --save-dev
npx cap add ios
npm run build          # outputs to dist/client (already set as webDir)
npx cap sync ios
npx cap open ios
```

`capacitor.config.ts` is already committed with appId `app.lovable.reborn`.
Change `appId` if you want your own bundle identifier.

## 3. HealthKit (manual, Xcode + Apple Developer account required)

1. Install the plugin: `npm install capacitor-health && npx cap sync ios`
2. In Xcode: select the **App** target → **Signing & Capabilities** → **+ Capability** →
   **HealthKit**.
3. In **Info.plist** add:
   - `NSHealthShareUsageDescription` — "Reborn reads your steps, active energy and workouts to suggest cardio logs."
   - `NSHealthUpdateUsageDescription` — "Reborn can record completed sessions to Health."
4. HealthKit requires a paid Apple Developer account and a real device (the
   Simulator has no Health data).
5. Sign the app with your team, then Run on your iPhone.

Inside the app: **Profile → Apple Health → Grant access → Sync today**. Steps, active
energy and workout minutes are shown as a suggestion you confirm before it counts.

## 4. Local notifications

`@capacitor/local-notifications` is already installed. Nothing else is required —
on first enable the app requests permission and schedules a repeating daily reminder
at the time you pick in **Profile → Daily reminders**.

On web, the same settings use the browser Notifications API with the service worker
at `public/sw.js`. iOS Safari only shows web notifications for apps added to the Home
Screen, which is why the native build is the reliable path.

## 5. Distribution

- For personal use: free provisioning lets you install on your own device (re-sign
  every 7 days).
- For TestFlight/App Store: paid Apple Developer Program, archive in Xcode
  (**Product → Archive**) and upload to App Store Connect.
