# LottoLoJo Handleiding (beheer & deelnemers)

## Gebruikersbeheer
- Gebruikers registreren met e-mailverificatie (verplicht).
- Gebruikers kunnen zich uitschrijven (account verwijderen) via de frontend.
- Admin kan gebruikers verwijderen via de backend/admin-paneel.

## Creditsysteem
- Admin kan credits toevoegen aan een gebruiker (bijv. na betaling).
- Credits bepalen of een deelnemer actief mee kan doen aan de loterij.
- Trekking kost €2,50 per keer. Uitbetaling = pot - 15% organisatie.

## E-mailverificatie
- Gebruiker ontvangt een verificatielink per e-mail (Nodemailer/Gmail SMTP).
- Pas na bevestigen van e-mail kan gebruiker inloggen.

## Technisch beheer (deployen/testen)
1. Zorg dat je `.env` in `apps/backend/` bevat:
   ```
   GMAIL_USER=jougmailadres@gmail.com
   GMAIL_PASS=appspecifiek-wachtwoord
   FRONTEND_URL=https://jouw-frontend-url
   JWT_SECRET=ietsgeheim
   ```
2. Commit en push je wijzigingen naar GitHub:
   ```
   git add .
   git commit -m "Nieuwe features: e-mailverificatie, creditsysteem, beheeropties"
   git push
   ```
3. Render.com pakt automatisch de nieuwste versie op (of klik op 'Manual Deploy').
4. Test registratie, e-mailverificatie, login, credits toevoegen en verwijderen van gebruikers.

## TODO
- Implementeer frontend-knop voor uitschrijven (account verwijderen).
- Implementeer admin-paneel voor credits en gebruikersbeheer.
- Voeg 2FA toe voor extra veiligheid indien gewenst.

---
Voor vragen of hulp: zie code of neem contact op met de beheerder.
