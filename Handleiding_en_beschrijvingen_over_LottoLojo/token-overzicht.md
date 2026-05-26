# Token-overzicht LottoLoJo

## 1. JWT Token (Authenticatie)
- **Opgeslagen in:** `localStorage` (browser) onder de sleutel `lotto_token`
- **Verkrijgen:** Na succesvol inloggen via het AuthModal component (`/auth/login` endpoint)
- **Gebruik:** Bij elke beveiligde API-call in de headers:
  ```
  Authorization: Bearer <token>
  ```
- **JWT secret:** In backend `.env` bestand:
  ```
  JWT_SECRET=ietsgeheim
  ```

## 2. Gekozen nummers
- **Opgeslagen in:** `localStorage` onder de sleutel `lotto_numbers`
- **Ophalen:** Bij openen Dashboard of na opnieuw inloggen, uit backend via `/numbers` (met JWT token)
- **Opslaan:** Na kiezen van 10 nummers, lokaal in `localStorage` én via POST naar `/numbers` (met JWT token)

## 3. API URL
- **Ingesteld in:** `.env` bestand van de frontend, bijvoorbeeld:
  ```
  VITE_API_URL=https://lotjo-back.onrender.com
  ```
- **Gebruik:**
  ```
  fetch(import.meta.env.VITE_API_URL + "/numbers", ...)
  ```

## 4. Reset Token (wachtwoord reset)
- **Gebruikt in:** Tijdelijk in React state bij wachtwoord reset
- **Verkrijgen:** Via e-mail na aanvraag reset

---

Plaats deze uitleg in de handleiding zodat je altijd weet waar je tokens vindt en hoe ze werken.
