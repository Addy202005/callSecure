# callSecure Mobile - React Native Fraud Call Defense (JavaScript)

A full-featured **React Native application** written in **JavaScript** for iOS and Android smartphones, providing real-time AI scam detection, live speech streaming, biometric evidence vault, and automated Cybercrime Portal (1930) reporting.

---

## 🚀 Key Mobile Features

1. **Contacts Screen (`src/screens/ContactsScreen.js`)**:
   - Modern mobile contact manager with search bar (name, phone, company).
   - Fast filtering for **Favorites**, **Blocked**, **Suspicious/Fraud**, and **Emergency**.
   - Ordered by most frequently used (`callCount`) in Favorites and Blocked.
   - Contact cards with verified badges, 3-dot context menu, one-tap callSecure call.
   - Simplified Add Contact modal with streamlined required fields.

2. **Dialer Screen (`src/screens/DialpadScreen.js`)**:
   - Complete 12-key DTMF dialpad with number display and backspace.
   - Circular call button at bottom.
   - Quick one-tap **Scam Scenario Simulators** (Digital Arrest Extortion, Bank KYC OTP Theft, FedEx Contraband, Electricity Disconnection).

3. **Live Call Shield (`src/screens/LiveCallScreen.js`)**:
   - Live call duration timer and animated audio waveform.
   - Real-time speech transcript stream.
   - Dynamic **ThreatBanner** computing risk probability (0–99%), flagged legal extortion sections (IPC 420/120B/Digital Arrest), and defensive counter-advisory.
   - Suggested defensive counter-responses for victim protection.
   - Consent-managed encrypted recording saved to local device storage upon call termination.

4. **Encrypted Evidence Locker (`src/screens/SecureVaultScreen.js`)**:
   - 4-digit PIN authentication (Default: `1930`).
   - Call recordings with SHA-256 evidence integrity hashing and forensic transcript inspector.
   - One-tap handoff to National Cybercrime Reporting.

5. **1930 Cybercrime Reporting (`src/screens/CyberReportingScreen.js`)**:
   - Generates official complaint drafts conforming to the **National Cyber Crime Reporting Portal** (cybercrime.gov.in / 1930).
   - Direct emergency helpline dialing.
   - Native mobile sharing sheet to export police / cybercell dossier.

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or v20+)
- **Expo Go** app installed on your iPhone (App Store) or Android device (Google Play Store).

### 2. Installation
Navigate to the `mobile` directory:
```bash
cd mobile
npm install
```

### 3. Run on Physical Phone or Simulator
Start the Expo development server:
```bash
npx expo start
```

- **On Physical Phone**: Open camera (iOS) or Expo Go app (Android) and scan the QR code displayed in the terminal!
- **On Android Emulator**: Press `a` in the terminal.
- **On iOS Simulator**: Press `i` in the terminal (macOS only).
- **On Web**: Press `w` in the terminal.

---

## 🛠️ Project Structure
```text
mobile/
├── App.js                      # Root component with Tab & Call state orchestration
├── app.json                    # Expo & native app permissions configuration
├── index.js                    # Mobile application entry point
├── package.json                # Dependencies (React Native 0.74, Expo SDK 51)
└── src/
    ├── components/
    │   ├── AudioWaveform.js    # Animated dynamic audio equalizer
    │   ├── ContactCard.js      # Contact item card with 3-dot menu & risk badge
    │   ├── DialpadKey.js       # Dialpad key with letters and tactile feedback
    │   └── ThreatBanner.js     # Real-time AI threat & counter-advisory alert banner
    ├── data/
    │   ├── mockContacts.js     # Default verified contacts & known fraud numbers
    │   ├── mockInitialRecordings.js
    │   └── scamScenarios.js    # Realistic digital arrest & extortion scripts
    ├── screens/
    │   ├── ContactsScreen.js   # Contact list, search, filters & add modal
    │   ├── CyberReportingScreen.js # 1930 Cybercrime complaint generator & sharing
    │   ├── DialpadScreen.js    # Touch dialpad & scam simulation triggers
    │   ├── LiveCallScreen.js   # Active call UI with live transcript & threat meter
    │   └── SecureVaultScreen.js # PIN-protected evidence recordings locker
    └── services/
        ├── apiService.js       # AI analysis calling backend or local fallback
        ├── phraseDetectionService.js # Regex & keyword extortion cue detection engine
        └── storageService.js   # AsyncStorage persistence with in-memory sync cache
```
