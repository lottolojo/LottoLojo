# LottoLoJo – Lokale stappen voor frontend/backend en GitHub

Gebruik deze stappen altijd als je lokaal werkt of code naar GitHub pusht. Kopieer ze gerust bij elke wijziging!

---

## Frontend lokaal testen (na codewijziging)

1. Open een nieuwe PowerShell of Command Prompt.
2. Voer deze commando’s uit (elke regel apart):

```
cd d:
cd AAAProjecten
cd LottoLojo
cd apps
cd frontend
npm run build
npm run preview
```

- Kijk in de terminal welk poortnummer gebruikt wordt (bijvoorbeeld 4173 of 4174).
- Open de juiste link in je browser, bijvoorbeeld http://localhost:4173/ of http://192.168.0.174:4173/
- Sluit altijd oude preview-terminals vóór je een nieuwe start (Ctrl+C in terminal).

---

## Backend lokaal herstarten (indien nodig)

1. Open een nieuwe PowerShell of Command Prompt.
2. Voer uit:

```
cd d:
cd AAAProjecten
cd LottoLojo
cd apps
cd backend
npm run dev
```

of

```
npm start
```

---

## GitHub commit & push (na elke wijziging)

1. Open een nieuwe PowerShell of Command Prompt.
2. Ga naar de juiste map (frontend of backend):

```
cd d:
cd AAAProjecten
cd LottoLojo
cd apps
cd frontend
```

of

```
cd backend
```

3. Voer uit:

```
git add .
git commit -m "Jouw duidelijke commit boodschap"
git push
```

---

## Extra tips

- Sluit altijd oude preview-terminals vóór je een nieuwe start.
- Gebruik altijd de link/poort die in de terminal wordt getoond.
- Meerdere previews tegelijk kan verwarring geven.
- Zie je geen data? Controleer of backend draait en of je API_URL klopt.

---

Sla dit bestand op en open het wanneer je twijfelt!
