# LottoLoJo — Handleiding & Technische Documentatie

**Versie:** 2026.05.26.20  
**Laatste update:** 26 mei 2026  
**Ontwikkeld door:** Johân (met hulp van AI)

## Live URLs

| Onderdeel | URL |
|---|---|
| **Frontend (app)** | https://lottolojo-front.onrender.com |
| **Backend (API)** | https://lotjo-back.onrender.com |
| **Health-check** | https://lotjo-back.onrender.com/health |

---

## Inhoudsopgave

1. [Wat is LottoLoJo?](#1-wat-is-lottolojo)
2. [Hoe werkt het spel?](#2-hoe-werkt-het-spel)
3. [Registreren & inloggen](#3-registreren--inloggen)
4. [Nummers kiezen (deelnemer)](#4-nummers-kiezen-deelnemer)
5. [Credits & betalen](#5-credits--betalen)
6. [Trekkingsresultaat bekijken](#6-trekkingsresultaat-bekijken)
7. [Admin-paneel](#7-admin-paneel)
8. [Lokaal draaien (ontwikkelaars)](#8-lokaal-draaien-ontwikkelaars)
9. [Deployen op Render.com](#9-deployen-op-rendercom)
10. [Backend online houden (UptimeRobot)](#10-backend-online-houden-uptimerobot)
11. [Wijzigingen opslaan & live zetten (Git & GitHub)](#11-wijzigingen-opslaan--live-zetten-git--github)
12. [API-overzicht (endpoints)](#12-api-overzicht-endpoints)
13. [Database-structuur](#13-database-structuur)
14. [Versiehistorie](#14-versiehistorie)

---

## 1. Wat is LottoLoJo?

LottoLoJo is een privé loterij-spel in de stijl van lotto/bingo. Deelnemers kiezen eenmalig **10 nummers** (tussen 1 en 45) en spelen daarmee mee totdat iemand alle 10 nummers bij elkaar heeft.

Elke week worden de resultaten van de **officiële Lotto** gevolgd: de 6 getrokken Lotto-nummers worden ingevoerd door de admin. Over de weken heen worden alle unieke getrokken nummers bijgehouden. Zodra iemand alle 10 gekozen nummers heeft "afgevinkt" (elk nummer minstens één keer getrokken), wint die persoon de pot.

---

## 2. Hoe werkt het spel?

### Spelregels

- Elke deelnemer kiest **eenmalig 10 nummers** (1–45), uniek per deelnemer
- Elke week trekt de officiële Lotto **6 nummers**
- Het systeem houdt **cumulatief** bij welke nummers ooit zijn getrokken
- Als een nummer al eerder getrokken is, telt het niet nogmaals mee
- Een deelnemer wint zodra **alle 10 eigen nummers** in het cumulatieve getrokken-nummers-overzicht staan
- **De eerste trekking kan nooit een winnaar opleveren** (je hebt 10 nummers nodig, maar na 1 trekking zijn er maximaal 6 uniek gevallen)

### Pot-groei

- Elke deelnemer betaalt **€2,50 per trekking** (= 1 credit)
- Hoe meer trekkingen er voorbijgaan zonder winnaar, hoe groter de pot
- Dubbel vallende nummers (al eerder getrokken) zijn gunstig voor de pot: meer trekkingen nodig = meer inleg
- Bij jackpot: **winnaar krijgt 85%** van de pot, **15% gaat naar de organisatie**
- Bij meerdere winnaars wordt de 85% gelijkelijk verdeeld

### Kleuren van de ballen (in de app)

| Kleur | Betekenis |
|-------|-----------|
| **Goud** | Jouw nummer is nog **niet** getrokken — speelt nog mee |
| **Grijs** | Jouw nummer is al **wel** getrokken — afgevinkt |
| **Rood + trillend** | Jouw **laatste overgebleven** nummer (9 van 10 gevallen) |

---

## 3. Registreren & inloggen

### Deelnemer registreren

1. Ga naar de app-pagina
2. Klik op "Registreren"
3. Vul naam, e-mailadres en wachtwoord in
4. Je ontvangt een **verificatiemail** — klik op de link om je account te activeren
5. Na activering kun je inloggen

> Zonder e-mailverificatie is inloggen niet mogelijk. Als je de mail niet hebt ontvangen, vraag de admin om je account handmatig te activeren.

### Inloggen

1. Klik op "Inloggen"
2. Vul e-mailadres en wachtwoord in
3. Klik op "Versturen"
4. Je bent nu ingelogd en ziet het dashboard

### Wachtwoord vergeten

1. Klik op "Wachtwoord vergeten?" in het inlogscherm
2. Vul je e-mailadres in
3. Je ontvangt een reset-link per e-mail (geldig 30 minuten)

---

## 4. Nummers kiezen (deelnemer)

1. Log in op de app
2. Je ziet het dashboard "Jouw gekozen Lotjo nummers"
3. Klik op nummers om ze te selecteren (er klinkt een subtiel geluidje bij elk nummer)
4. Selecteer precies **10 nummers** — niet meer, niet minder
5. Klik op "Opslaan"
6. Je nummers worden opgeslagen in de database

> Je nummers blijven bewaard bij elke volgende login. Je kunt via "Kies opnieuw" nieuwe nummers kiezen.

---

## 5. Credits & betalen

- 1 credit = deelname aan **1 trekking** = **€2,50**
- Credits worden bijgehouden in je profiel
- Creditsstatus zie je bovenaan je dashboard:

| Status | Kleur | Betekenis |
|--------|-------|-----------|
| Meer dan 2 credits | **Groen** | Alles in orde |
| 1 of 2 credits | **Oranje** | Let op: bijna op |
| 0 credits | **Rood** | Niet meer actief — betaal vóór de volgende trekking |

- De admin voegt credits toe na ontvangst van betaling
- Bij 0 credits doe je niet meer mee aan de volgende trekking

---

## 6. Trekkingsresultaat bekijken

Na elke trekking (ingevoerd door de admin) zie je het dashboard bijgewerkt:

1. Log in na een nieuwe trekking
2. De ballen worden **één voor één geanimeerd** gecontroleerd
3. Per bal hoor je een geluid:
   - **Ping** (positief): jouw nummer is deze week gevallen
   - **Pop** (negatief): jouw nummer is niet gevallen
4. Gevallen nummers worden **grijs**, nog-te-vallen nummers blijven **goud**
5. Als je nog maar **1 nummer** mist: die bal wordt **rood en trilt elke 3 seconden**

### Na een Jackpot

Als jij alle 10 nummers hebt afgevinkt:
- Confetti regen over het scherm
- Jackpot-geluid speelt af
- Je krijgt twee opties:
  - **"Zelfde nummers"** — dezelfde 10 nummers voor de volgende ronde
  - **"Kies opnieuw"** — kies 10 nieuwe nummers

---

## 7. Admin-paneel

De admin-pagina is bereikbaar via `/admin-login`.

### Inloggen als admin

- Standaard admin-account: `lottolojo@gmail.com`
- Wachtwoord staat in de backend `.env` als `ADMIN_PASSWORD`
- Het admin-paneel is beschikbaar in **Nederlands 🇳🇱, Engels 🇬🇧 en Spaans 🇪🇸**

### Functies in het admin-paneel

#### Wekelijkse trekking invoeren

**Optie A — Handmatig:**
1. Kies de **datum** van de trekking
2. Voer de **6 gevallen Lotto-nummers** in
3. Klik op **"Trekking opslaan"**

**Optie B — Automatisch ophalen van Lotto.nl:**
1. Klik op **"🔄 Ophalen van Lotto.nl"**
2. De nummers en datum worden automatisch ingevuld vanuit de officiële Lotto-website
3. Controleer de nummers
4. Klik op **"Trekking opslaan"** om te bevestigen

> Bij elke opgeslagen trekking wordt automatisch 1 credit afgeschreven bij alle actieve deelnemers, en wordt de pot bijgewerkt.

> Elke **zaterdag om 21:05** probeert het systeem automatisch de trekking op te halen en op te slaan als concept (niet gepubliceerd). De admin ziet dit de volgende keer dat hij inlogt.

#### Pot bekijken

- Toont de **totale pot in euro's** (opgebouwd uit alle trekkingen × deelnemers × €2,50)
- Toont de **verwachte uitbetaling** als de pot al loopt:
  - Winnaar krijgt **85%** van de pot
  - Organisatie krijgt **15%** van de pot

#### Winnaar-sectie

- Als er nog geen winnaar is: toont de verwachte uitkering bij de huidige pot
- Als er een winnaar is: toont naam, e-mail, nummers en het uit te betalen bedrag per winnaar
- Bij meerdere winnaars wordt het bedrag gelijkelijk verdeeld

#### Lotto resetten (na Jackpot)

1. Zodra er een winnaar is, verschijnt de knop "Reset Lotto"
2. Na bevestiging worden alle trekkingen gewist en de pot op €0 gezet
3. Deelnemers kunnen kiezen: zelfde nummers of opnieuw kiezen

#### Gebruikersbeheer

Klik op een **naam** in de gebruikerslijst om het actiemenu te openen:

| Actie | Beschrijving |
|-------|-------------|
| **Goedkeuren** | Handmatig account activeren (als e-mailverificatie niet lukt) |
| **Blokkeren / Deblokkeren** | Toegang tijdelijk ontzeggen of herstellen |
| **Maak Admin** | Rol wijzigen naar admin |
| **Maak Deelnemer** | Rol terugzetten naar deelnemer |
| **Nummers resetten** | Gekozen nummers verwijderen — deelnemer moet opnieuw kiezen |
| **Credits aanpassen** | Creditssaldo handmatig instellen |
| **Verwijderen** | Account en alle gegevens permanent verwijderen |

#### Credits-kleurcodes (admin overzicht)

| Credits | Kleur |
|---------|-------|
| 0 | **Rood** |
| 1–2 | **Oranje** |
| 3+ | Normaal |

---

## 8. Lokaal draaien (ontwikkelaars)

### Vereisten

- Node.js v18+
- PostgreSQL-database (of Neon.tech)
- Git

### Stap 1: Backend opstarten

```bash
cd apps/backend
# Maak .env aan (zie voorbeeld hieronder)
npm install
npx prisma generate
npm run dev
```

**`apps/backend/.env` voorbeeld:**
```
DATABASE_URL="postgresql://gebruiker:wachtwoord@host/database?sslmode=require"
JWT_SECRET=JouwGeheimeSleutel
GMAIL_USER=jouw@gmail.com
GMAIL_PASS=app-specifiek-wachtwoord
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@jouwdomein.nl
ADMIN_PASSWORD=JouwAdminWachtwoord
```

### Stap 2: Frontend opstarten

```bash
cd apps/frontend
# Maak .env aan (zie voorbeeld hieronder)
npm install
npm run dev
```

**`apps/frontend/.env` voorbeeld:**
```
VITE_API_URL=http://localhost:4000
```

### Stap 3: Openen in browser

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Health-check: `http://localhost:4000/health`
- Admin-login: `http://localhost:5173/admin-login`

---

## 9. Deployen op Render.com

### Backend

1. Maak een nieuw **Web Service** aan op Render
2. Koppel je GitHub-repo
3. Stel build command in: `npm install && npx prisma generate`
4. Stel start command in: `node src/index.js` (of `npm start`)
5. Voeg alle **Environment Variables** toe (zie `.env` voorbeeld hierboven)
6. Deploy

### Frontend

1. Maak een nieuw **Static Site** aan op Render
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Voeg toe: `VITE_API_URL=https://jouw-backend-url.onrender.com`
5. Deploy

> Na elke `git push` naar de gekoppelde branch deploy Render automatisch.

### Live URL's (LottoLoJo)

| Onderdeel | URL |
|-----------|-----|
| **Frontend (app)** | `https://lottolojo-front.onrender.com` |
| **Backend (API)** | `https://lotjo-back.onrender.com` |
| **Health-check** | `https://lotjo-back.onrender.com/health` |

---

## 10. Backend online houden (UptimeRobot)

De gratis tier van Render.com zet de backend na 15 minuten inactiviteit in slaapstand. UptimeRobot voorkomt dit door elke 5 minuten een ping te sturen.

### Status checken

- **Live statuspagina:** [https://stats.uptimerobot.com/a4Ny5fjsKT](https://stats.uptimerobot.com/a4Ny5fjsKT)  
  *(Openbaar — iedereen kan hier zien of de backend online is)*
- **Beheerdersdashboard:** [https://dashboard.uptimerobot.com/monitors](https://dashboard.uptimerobot.com/monitors)  
  *(Alleen toegankelijk met je UptimeRobot-account)*

### Wat monitort UptimeRobot?

UptimeRobot pingt elke 5 minuten het `/health` endpoint:
```
https://lotjo-back.onrender.com/health
```

> Tip: stel ook een monitor in voor de frontend: `https://lottolojo-front.onrender.com`
Dit endpoint antwoordt met `{ "status": "ok", "timestamp": "..." }` als de backend actief is.

### UptimeRobot instellen (nieuw project)

1. Ga naar [uptimerobot.com](https://uptimerobot.com) — maak gratis account
2. Klik **"+ New Monitor"**
3. Kies type: **HTTP(s)**
4. Vul in: `https://lotjo-back.onrender.com/health`
5. Interval: **5 minuten**
6. Klik **"Create Monitor"**

> Als de backend tóch down gaat, ontvang je automatisch een e-mailmelding van UptimeRobot.

---

## 11. Wijzigingen opslaan & live zetten (Git & GitHub)

Dit is de stap-voor-stap uitleg (voor als je niet bekend bent met Git).

### Wat is Git en waarom?

- **Git** is een systeem dat bijhoudt welke wijzigingen je hebt gemaakt in de code
- **GitHub** is de plek op internet waar je code staat opgeslagen
- **Render.com** kijkt naar GitHub: zodra je nieuwe code pusht, bouwt Render automatisch een nieuwe versie

### Wanneer moet je committen en pushen?

Na elke aanpassing aan de code die je live wilt hebben. Denk aan:
- Nieuwe functies toegevoegd
- Bugs opgelost
- Teksten of kleuren gewijzigd

### Hoe doe je het? (stap voor stap)

**1. Open een terminal in de projectmap** (in Cursor: onderin op "Terminal" klikken)

**2. Controleer welke bestanden zijn gewijzigd:**
```bash
git status
```
Je ziet een lijst van gewijzigde bestanden in het rood.

**3. Voeg alle wijzigingen toe:**
```bash
git add .
```
*(De punt `.` betekent: alles toevoegen. Je kunt ook een specifiek bestand opgeven.)*

**4. Maak een commit met een beschrijving:**
```bash
git commit -m "Beschrijving van wat je hebt gedaan"
```
Voorbeelden:
```bash
git commit -m "Automatisch ophalen Lotto.nl toegevoegd"
git commit -m "Bug opgelost: rode bal verdween na trilling"
git commit -m "Handleiding bijgewerkt"
```

**5. Push naar GitHub:**
```bash
git push
```

**6. Render.com bouwt automatisch opnieuw** — na ~2 minuten is de live versie bijgewerkt.

### Belangrijk: wat NOOIT committen?

- Het `.env` bestand — dit bevat wachtwoorden en geheime sleutels!
- Het staat al in `.gitignore`, dus het wordt automatisch overgeslagen.

### Snel controleren of de deploy gelukt is

1. Ga naar [render.com](https://render.com) → jouw service
2. Klik op "Events" of "Logs" — je ziet of de build geslaagd is
3. Of check de health-check: [https://lotjo-back.onrender.com/health](https://lotjo-back.onrender.com/health)

---

## 12. API-overzicht (endpoints)

Alle endpoints beginnen met `/auth/`.

### Publiek (geen token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| GET | `/health` | Health-check (gebruikt door UptimeRobot) |
| POST | `/auth/register` | Registreer nieuwe gebruiker |
| POST | `/auth/login` | Inloggen, geeft JWT-token |
| GET | `/auth/verify-email` | E-mailverificatie via link |
| POST | `/auth/forgot-password` | Wachtwoord-reset verzoek |
| POST | `/auth/reset-password` | Wachtwoord daadwerkelijk resetten |

### Deelnemer (JWT-token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| GET | `/auth/me` | Eigen profiel + credits ophalen |
| GET | `/auth/numbers` | Eigen gekozen nummers ophalen |
| POST | `/auth/numbers` | Nummers opslaan (precies 10) |
| GET | `/auth/draw/latest` | Laatste trekking ophalen |
| GET | `/auth/draw/cumulative` | Alle ooit-getrokken unieke nummers |

### Admin (admin JWT-token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| GET | `/auth/admin/users` | Alle gebruikers ophalen |
| GET | `/auth/admin/pot` | Pot-totaal berekenen |
| GET | `/auth/admin/winner` | Winnaars bepalen |
| GET | `/auth/admin/draws` | Recente trekkingen ophalen |
| GET | `/auth/admin/fetch-lotto-draw` | Actuele trekking ophalen van Lotto.nl |
| POST | `/auth/admin/draw` | Nieuwe trekking invoeren |
| POST | `/auth/admin/reset-lotto` | Hele lotto resetten |
| POST | `/auth/admin/approve-user/:userId` | Gebruiker goedkeuren |
| POST | `/auth/admin/toggle-block/:userId` | Gebruiker blokkeren/deblokkeren |
| POST | `/auth/admin/set-role` | Rol wijzigen |
| POST | `/auth/admin/set-credits` | Credits aanpassen |
| DELETE | `/auth/admin/reset-numbers/:userId` | Nummers van gebruiker resetten |
| DELETE | `/auth/admin/delete-user/:userId` | Gebruiker verwijderen |

---

## 13. Database-structuur

De database draait op **PostgreSQL via Neon.tech** en wordt beheerd met **Prisma ORM**.

| Tabel | Beschrijving |
|-------|-------------|
| `User` | Alle gebruikers (naam, e-mail, wachtwoord, rol, goedkeuring) |
| `ParticipantProfile` | Credits, actief-status per deelnemer |
| `NumberSelection` | Gekozen nummers per deelnemer (10 stuks, opgeslagen als JSON) |
| `Draw` | Ingevoerde trekkingen (datum + 6 gevallen nummers als JSON) |
| `DrawEntry` | Koppeling deelnemer ↔ trekking (resultaten) |
| `PotTransaction` | Financiële mutaties van de pot (aangemaakt bij elke trekking) |
| `Payout` | Uitbetalingen aan winnaars |
| `Setting` | App-instellingen (inschrijfgeld, organisatiepercentage) |
| `TwoFactorCode` | Tijdelijke codes voor e-mailverificatie en wachtwoord-reset |

---

## 14. Versiehistorie

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| `2026.05.24.1` | 24 mei 2026 | Eerste volledige werkende versie: login, nummerregistratie, admin-paneel, trekkingen, ballanimaties, geluiden, confetti, creditssysteem, gebruikersbeheer |
| `2026.05.26.1` | 26 mei 2026 | Logo verbeterd: knipoog verwijderd. Handleiding aangemaakt. Versienummer bijgewerkt. |
| `2026.05.26.2` | 26 mei 2026 | Cumulatieve spellogica geïmplementeerd. Backend: nieuw endpoint `/auth/draw/cumulative`. Winner-check herschreven naar 10 van 10. Frontend: `isFallen` cumulatief, reveal-animatie splitst nieuw vs. eerder gevallen. `lastNeeded` triggert bij 9 van 10. |
| `2026.05.26.3` | 26 mei 2026 | AdminPanel vertaald naar NL/EN/ES. Taalwisselaar met vlag-emoji's. Taalvoorkeur opgeslagen in localStorage. |
| `2026.05.26.4` | 26 mei 2026 | Automatisch 1 credit afschrijven bij trekking. Logo: gele glow verwijderd, vonkjes versterkt. |
| `2026.05.26.5–8` | 26 mei 2026 | Logo-animatie LOJO-ballen: starten als cijferballen, draaien één voor één geel met letter. Vonkjes willekeurig geplaatst. Mobiel: alleen 4 LOJO-ballen zichtbaar. |
| `2026.05.26.9` | 26 mei 2026 | Reveal-animatie verfijnd: al eerder gevallen nummers tonen direct, alleen nieuw gevallen nummers animeren. Geluid: match-geluid bij iedere trekkings-match, jackpot-geluid bij 10/10. |
| `2026.05.26.10` | 26 mei 2026 | Fix: rode "laatste bal" verdween na trilling. Bal blijft nu zichtbaar, trilt elke 3 seconden continu. |
| `2026.05.26.11` | 26 mei 2026 | Pot-berekening herschreven: aangemaakt via PotTransaction bij elke trekking (geen schatting meer). Na reset pot = €0. |
| `2026.05.26.12` | 26 mei 2026 | Winnaar-sectie: duplicaten verwijderd (deduplicatie per userId). Uitbetaling per winnaar zichtbaar (85% gedeeld). Subtiele alternerende achtergrond per winnaar. |
| `2026.05.26.13` | 26 mei 2026 | Automatisch ophalen van Lotto.nl: knop "🔄 Ophalen van Lotto.nl" in admin-paneel. Cron job elke zaterdag 21:05. `/health` endpoint voor UptimeRobot. Handleiding uitgebreid met UptimeRobot, Git-uitleg en deploy-stappen. |

---

*Voor technische vragen of bugmeldingen: neem contact op met de beheerder.*

---

## Inhoudsopgave

1. [Wat is LottoLoJo?](#1-wat-is-lottolojo)
2. [Hoe werkt het spel?](#2-hoe-werkt-het-spel)
3. [Registreren & inloggen](#3-registreren--inloggen)
4. [Nummers kiezen (deelnemer)](#4-nummers-kiezen-deelnemer)
5. [Credits & betalen](#5-credits--betalen)
6. [Trekkingsresultaat bekijken](#6-trekkingsresultaat-bekijken)
7. [Admin-paneel](#7-admin-paneel)
8. [Lokaal draaien (ontwikkelaars)](#8-lokaal-draaien-ontwikkelaars)
9. [Deployen op Render.com](#9-deployen-op-rendercom)
10. [API-overzicht (endpoints)](#10-api-overzicht-endpoints)
11. [Database-structuur](#11-database-structuur)
12. [Versiehistorie](#12-versiehistorie)

---

## 1. Wat is LottoLoJo?

LottoLoJo is een privé loterij-spel in de stijl van lotto/bingo. Deelnemers kiezen eenmalig **10 nummers** (tussen 1 en 45) en spelen daarmee mee totdat iemand alle 10 nummers bij elkaar heeft.

Elke week worden de resultaten van de **officiële Lotto** gevolgd: de 6 getrokken Lotto-nummers worden ingevoerd door de admin. Over de weken heen worden alle unieke getrokken nummers bijgehouden. Zodra iemand alle 10 gekozen nummers heeft "afgevinkt" (elk nummer minstens één keer getrokken), wint die persoon de pot.

---

## 2. Hoe werkt het spel?

### Spelregels

- Elke deelnemer kiest **eenmalig 10 nummers** (1–45), uniek per deelnemer
- Elke week trekt de officiële Lotto **6 nummers**
- Het systeem houdt **cumulatief** bij welke nummers ooit zijn getrokken
- Als een nummer al eerder getrokken is, telt het niet nogmaals mee
- Een deelnemer wint zodra **alle 10 eigen nummers** in het cumulatieve getrokken-nummers-overzicht staan
- **De eerste trekking kan nooit een winnaar opleveren** (je hebt 10 nummers nodig, maar na 1 trekking zijn er maximaal 6 uniek gevallen)

### Pot-groei

- Elke deelnemer betaalt **€2,50 per trekking** (= 1 credit)
- Hoe meer trekkingen er voorbijgaan zonder winnaar, hoe groter de pot
- Dubbel vallende nummers (al eerder getrokken) zijn gunstig voor de pot: meer trekkingen nodig = meer inleg
- Bij jackpot wordt de pot uitbetaald aan de winnaar (minus 15% organisatiekosten)

### Kleuren van de ballen (in de app)

| Kleur | Betekenis |
|-------|-----------|
| **Goud** | Jouw nummer is nog **niet** getrokken — speelt nog mee |
| **Grijs** | Jouw nummer is al **wel** getrokken — afgevinkt |
| **Rood + trillend** | Jouw **laatste overgebleven** nummer (9 van 10 gevallen) |

---

## 3. Registreren & inloggen

### Deelnemer registreren

1. Ga naar de app-pagina
2. Klik op "Registreren"
3. Vul naam, e-mailadres en wachtwoord in
4. Je ontvangt een **verificatiemail** — klik op de link om je account te activeren
5. Na activering kun je inloggen

> Zonder e-mailverificatie is inloggen niet mogelijk. Als je de mail niet hebt ontvangen, vraag de admin om je account handmatig te activeren.

### Inloggen

1. Klik op "Inloggen"
2. Vul e-mailadres en wachtwoord in
3. Klik op "Versturen"
4. Je bent nu ingelogd en ziet het dashboard

### Wachtwoord vergeten

1. Klik op "Wachtwoord vergeten?" in het inlogscherm
2. Vul je e-mailadres in
3. Je ontvangt een reset-link per e-mail (geldig 30 minuten)

---

## 4. Nummers kiezen (deelnemer)

1. Log in op de app
2. Je ziet het dashboard "Jouw gekozen Lotjo nummers"
3. Klik op nummers om ze te selecteren (er klinkt een subtiel geluidje bij elk nummer)
4. Selecteer precies **10 nummers** — niet meer, niet minder
5. Klik op "Opslaan"
6. Je nummers worden opgeslagen in de database

> Je nummers blijven bewaard bij elke volgende login. Je kunt via "Kies opnieuw" nieuwe nummers kiezen.

---

## 5. Credits & betalen

- 1 credit = deelname aan **1 trekking** = **€2,50**
- Credits worden bijgehouden in je profiel
- Creditsstatus zie je bovenaan je dashboard:

| Status | Kleur | Betekenis |
|--------|-------|-----------|
| Meer dan 2 credits | **Groen** | Alles in orde |
| 1 of 2 credits | **Oranje** | Let op: bijna op |
| 0 credits | **Rood** | Niet meer actief — betaal vóór de volgende trekking |

- De admin voegt credits toe na ontvangst van betaling
- Bij 0 credits doe je niet meer mee aan de volgende trekking

---

## 6. Trekkingsresultaat bekijken

Na elke trekking (ingevoerd door de admin) zie je het dashboard bijgewerkt:

1. Log in na een nieuwe trekking
2. De ballen worden **één voor één geanimeerd** gecontroleerd
3. Per bal hoor je een geluid:
   - **Ping** (positief): jouw nummer is deze week gevallen
   - **Pop** (negatief): jouw nummer is niet gevallen
4. Gevallen nummers worden **grijs**, nog-te-vallen nummers blijven **goud**
5. Als je nog maar **1 nummer** mist: die bal wordt **rood en trilt** — de spanning is voelbaar!

### Na een Jackpot

Als jij alle 10 nummers hebt afgevinkt:
- Confetti regen over het scherm
- Je krijgt twee opties:
  - **"Zelfde nummers"** — dezelfde 10 nummers voor de volgende ronde
  - **"Kies opnieuw"** — kies 10 nieuwe nummers

---

## 7. Admin-paneel

De admin-pagina is bereikbaar via `/admin-login`.

### Inloggen als admin

- Standaard admin-account: `lottolojo@gmail.com`
- Wachtwoord staat in de backend `.env` als `ADMIN_PASSWORD`

### Functies in het admin-paneel

#### Wekelijkse trekking invoeren

1. Kies de **datum** van de trekking
2. Voer de **6 gevallen Lotto-nummers** in
3. Klik op "Trekking opslaan"
4. De nummers worden cumulatief bijgehouden — deelnemers zien de update bij hun volgende login

#### Pot bekijken

- Toont de **totale pot in euro's** (credits × €2,50)
- Toont de **winnaar(s)** zodra iemand alle 10 nummers heeft

#### Lotto resetten (na Jackpot)

1. Zodra er een winnaar is, verschijnt de knop "Reset Lotto"
2. Na bevestiging worden alle trekkingen gewist en de pot op €0 gezet
3. Deelnemers kunnen kiezen: zelfde nummers of opnieuw kiezen

#### Gebruikersbeheer

Klik op een **naam** in de gebruikerslijst om het actiemenu te openen:

| Actie | Beschrijving |
|-------|-------------|
| **Goedkeuren** | Handmatig account activeren (als e-mailverificatie niet lukt) |
| **Blokkeren / Deblokkeren** | Toegang tijdelijk ontzeggen of herstellen |
| **Maak Admin** | Rol wijzigen naar admin (max. 2 extra admins toegestaan) |
| **Maak Deelnemer** | Rol terugzetten naar deelnemer |
| **Nummers resetten** | Gekozen nummers verwijderen — deelnemer moet opnieuw kiezen |
| **Credits aanpassen** | Creditssaldo handmatig instellen |
| **Verwijderen** | Account en alle gegevens permanent verwijderen |

#### Credits-kleurcodes (admin overzicht)

| Credits | Kleur |
|---------|-------|
| 0 | **Rood** |
| 1–2 | **Oranje** |
| 3+ | Normaal |

---

## 8. Lokaal draaien (ontwikkelaars)

### Vereisten

- Node.js v18+
- PostgreSQL-database (of Neon.tech)
- Git

### Stap 1: Backend opstarten

```bash
cd apps/backend
# Maak .env aan (zie voorbeeld hieronder)
npm install
npx prisma generate
npm run dev
```

**`apps/backend/.env` voorbeeld:**
```
DATABASE_URL="postgresql://gebruiker:wachtwoord@host/database?sslmode=require"
JWT_SECRET=JouwGeheimeSleutel
GMAIL_USER=jouw@gmail.com
GMAIL_PASS=app-specifiek-wachtwoord
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@jouwdomein.nl
ADMIN_PASSWORD=JouwAdminWachtwoord
```

### Stap 2: Frontend opstarten

```bash
cd apps/frontend
# Maak .env aan (zie voorbeeld hieronder)
npm install
npm run dev
```

**`apps/frontend/.env` voorbeeld:**
```
VITE_API_URL=http://localhost:4000
```

### Stap 3: Openen in browser

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Admin-login: `http://localhost:5173/admin-login`

---

## 9. Deployen op Render.com

### Backend

1. Maak een nieuw **Web Service** aan op Render
2. Koppel je GitHub-repo
3. Stel build command in: `npm install && npx prisma generate`
4. Stel start command in: `node src/index.js` (of `npm start`)
5. Voeg alle **Environment Variables** toe (zie `.env` voorbeeld hierboven)
6. Deploy

### Frontend

1. Maak een nieuw **Static Site** aan op Render
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Voeg toe: `VITE_API_URL=https://jouw-backend-url.onrender.com`
5. Deploy

> Na elke `git push` naar de gekoppelde branch deploy Render automatisch.

---

## 10. API-overzicht (endpoints)

Alle endpoints beginnen met `/auth/`.

### Publiek (geen token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| POST | `/auth/register` | Registreer nieuwe gebruiker |
| POST | `/auth/login` | Inloggen, geeft JWT-token |
| GET | `/auth/verify-email` | E-mailverificatie via link |
| POST | `/auth/request-password-reset` | Wachtwoord-reset verzoek |
| POST | `/auth/reset-password` | Wachtwoord daadwerkelijk resetten |

### Deelnemer (JWT-token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| GET | `/auth/me` | Eigen profiel + credits ophalen |
| GET | `/auth/numbers` | Eigen gekozen nummers ophalen |
| POST | `/auth/numbers` | Nummers opslaan (precies 10) |
| GET | `/auth/draw/latest` | Laatste trekking ophalen |

### Admin (admin JWT-token vereist)

| Methode | Endpoint | Beschrijving |
|---------|----------|-------------|
| GET | `/auth/admin/users` | Alle gebruikers ophalen |
| GET | `/auth/admin/pot` | Pot-totaal berekenen |
| GET | `/auth/admin/winner` | Winnaars bepalen |
| GET | `/auth/admin/draws` | Recente trekkingen ophalen |
| POST | `/auth/admin/draw` | Nieuwe trekking invoeren |
| POST | `/auth/admin/reset-lotto` | Hele lotto resetten |
| POST | `/auth/admin/approve-user/:userId` | Gebruiker goedkeuren |
| POST | `/auth/admin/toggle-block/:userId` | Gebruiker blokkeren/deblokkeren |
| POST | `/auth/admin/set-role` | Rol wijzigen |
| POST | `/auth/admin/set-credits` | Credits aanpassen |
| DELETE | `/auth/admin/reset-numbers/:userId` | Nummers van gebruiker resetten |
| DELETE | `/auth/admin/delete-user/:userId` | Gebruiker verwijderen |

---

## 11. Database-structuur

De database draait op **PostgreSQL via Neon.tech** en wordt beheerd met **Prisma ORM**.

| Tabel | Beschrijving |
|-------|-------------|
| `User` | Alle gebruikers (naam, e-mail, wachtwoord, rol, goedkeuring) |
| `ParticipantProfile` | Credits, actief-status per deelnemer |
| `NumberSelection` | Gekozen nummers per deelnemer (10 stuks, opgeslagen als JSON) |
| `Draw` | Ingevoerde trekkingen (datum + 6 gevallen nummers als JSON) |
| `DrawEntry` | Koppeling deelnemer ↔ trekking (resultaten) |
| `PotTransaction` | Financiële mutaties van de pot |
| `Payout` | Uitbetalingen aan winnaars |
| `Setting` | App-instellingen (inschrijfgeld, organisatiepercentage) |
| `TwoFactorCode` | Tijdelijke codes voor e-mailverificatie en wachtwoord-reset |

---

## 12. Versiehistorie

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| `2026.05.24.1` | 24 mei 2026 | Eerste volledige werkende versie: login, nummerregistratie, admin-paneel, trekkingen, ballanimaties, geluiden, confetti, creditssysteem, gebruikersbeheer |
| `2026.05.26.1` | 26 mei 2026 | Logo verbeterd: knipoog verwijderd, "o" krijgt subtiele pulserende glow. Handleiding aangemaakt. Versienummer bijgewerkt. |
| `2026.05.26.2` | 26 mei 2026 | Cumulatieve spellogica geïmplementeerd. Backend: nieuw endpoint `/auth/draw/cumulative`. Winner-check herschreven naar 10 van 10. Frontend: `isFallen` cumulatief, reveal-animatie splitst nieuw vs. eerder gevallen. `lastNeeded` triggert bij 9 van 10. Alle teksten bijgewerkt naar 10 nummers. |
| `2026.05.26.3` | 26 mei 2026 | AdminPanel volledig vertaald naar NL/EN/ES. Taalwisselaar op beide pagina's omgezet naar vlag-emoji's (🇳🇱 🇬🇧 🇪🇸). Taalvoorkeur admin opgeslagen in localStorage. |
| `2026.05.26.4` | 26 mei 2026 | Bij elke trekking wordt automatisch 1 credit afgeschreven bij alle actieve deelnemers (creditsBalance > 0). Succes-melding toont hoeveel deelnemers zijn afgeschreven. Logo: gele glow op "o" verwijderd, drie sterretjes versterkt met glow-filter en puls-animatie op grootte. |

---

*Voor technische vragen of bugmeldingen: neem contact op met de beheerder.*
