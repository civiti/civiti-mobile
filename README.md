# Civiti Mobile

Aplicația mobilă nativă a platformei [Civiti](https://civiti.ro) — participare civică pentru România, direct de pe telefon.

[![Download on the App Store](https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg)](https://apps.apple.com/ro/app/civiti/id6760908767?l=ro)

## Ce face

Versiunea mobilă a platformei Civiti, cu aceleași funcționalități de bază ca și aplicația web:

- Raportarea problemelor civice cu foto și localizare
- Vizualizarea problemelor din comunitate
- Campanii de email către autorități
- Autentificare cu Google OAuth sau Apple Sign-In

## Tech Stack

- **Framework**: Expo / React Native
- **Navigare**: Expo Router (file-based routing)
- **Auth**: Supabase Auth (Google OAuth + Apple Sign-In)
- **State Management**: Zustand / React Context
- **Backend**: [civiti-server](https://github.com/civiti/civiti-server)

## Dezvoltare locală

```bash
npm install
npx expo start
```

Necesită un fișier `.env` — vezi `.env.example` pentru variabilele necesare.

## Deployment

- **iOS**: Disponibilă pe [App Store](https://apps.apple.com/ro/app/civiti/id6760908767?l=ro)
- **Android**: În dezvoltare

## Alte repo-uri

- [civiti-web](https://github.com/civiti/civiti-web) — Frontend (Angular 19)
- [civiti-server](https://github.com/civiti/civiti-server) — Backend (.NET 8 / C#)
