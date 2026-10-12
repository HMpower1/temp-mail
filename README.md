# Temp Mail

Produkcja: https://temp-mail.serwerbb.win. Istniejąca aplikacja Next.js 16 / React 19 / TypeScript / Tailwind, Fastify, PostgreSQL 17 tmpfs/UNLOGGED, Docker i Caddy.

Skrzynki wyłącznie odbierają pocztę i mają twarde 60 minut. Przedłużanie wyłączone. HTML sanityzowany i izolowany w iframe sandbox bez połączeń zewnętrznych. Załączniki: tylko nazwy i rozmiary. Odbiór internetowy Mailgun EU jest skonfigurowany i potwierdzony realną wiadomością: EMAIL_SETUP.md. AdSense wyłączone: ADSENSE_SETUP.md. Stan i ograniczenia: PLAN.md.

## Aktualizacja
Node >=22.13, npm i Docker Compose. Zachowaj istniejące deploy/.env.

1. npm ci oraz npm ci --prefix server
2. npm run lint
3. node --experimental-strip-types --test server/test/*.test.mjs
4. npx tsc --noEmit
5. npm run build
6. docker compose -p temp-mail --env-file deploy/.env -f deploy/compose.home.yaml up -d --build
7. node deploy/verify.mjs

Obraz web kopiuje standalone z wcześniejszego builda. SMTP do lokalnych testów na 127.0.0.1:2525, API receiver tylko w sieci Docker. Nie dołączaj smtp.override.yaml przy wdrażaniu Mailgun. Produkcja używa compose.home.yaml i caddy_default. compose.yaml jest starszym wariantem osobnego serwera. Caddyblock w deploy/caddy.home.block, wyjątek root ads.txt opisany w ADSENSE_SETUP.md.

## Zmienne produkcyjne
- POSTGRES_PASSWORD, MAIL_API_KEY: istniejące sekrety. DATABASE_URL i MAIL_API_ORIGIN budowane przez Compose. SITE_ORIGIN=https://temp-mail.serwerbb.win.
- MAIL_DOMAIN=inbox.temp-mail.serwerbb.win; MAIL_INGRESS_READY=true po potwierdzonym odbiorze.
- MAILGUN_API_KEY: tylko provisioning, nie jest przekazywany aplikacji. MAILGUN_WEBHOOK_SIGNING_KEY: receiver, pobierany przez setup-mailgun.mjs.
- NEXT_PUBLIC_ADSENSE_CLIENT, NEXT_PUBLIC_ADSENSE_SLOT_TOP, NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM: rzeczywiste publiczne ID z AdSense, domyślnie puste.
- ADSENSE_ENABLED=false, ADSENSE_SITE_STATUS puste, ADSENSE_CMP_PUBLISHED=false. Włączenie po Ready i testach CMP.
- CLOUDFLARE_TOKEN_FILE: istniejący plik tokenu DNS montowany read-only przez compose.ddns.yaml.

Nie publikuj .env i sekretów. Baza bez trwałego wolumenu, restart PostgreSQL usuwa dane. Bez snapshotów/kopii treści, logowania body, cookie czy nagłówków podpisu. Limity pojedynczej instancji: 10 skrzynek/h, 180 żądań/min klienta, webhook 240/min; 100 wiadomości/20 MiB na skrzynkę, 2 MiB wiadomości, 1 MiB załącznika, 10 załączników, 4 MiB webhook.

## Przygotowanie prywatnego repozytorium — 2026-10-12

Serwis tymczasowych skrzynek pocztowych: Next.js, React, odbiornik SMTP/HTTP Node.js i PostgreSQL.

Źródło bieżącego wdrożenia: `C:\Users\hmpow\Documents\Codex\2026-10-02\zbuduj-i-opublikuj-kompletn-aplikacj-webow-3\work\temp-mail`. Ten katalog jest oddzielną kopią przygotowaną do wersjonowania; działające kontenery nadal używają oryginału. Nie przeniesiono baz danych ani wolumenów. Nie dodano licencji open source.

### Wymagania i instalacja

Windows/PowerShell, Git, Docker Desktop z kontenerami Linux i Compose obsługującym `!override` (2.24.4 lub nowszy). Aplikacje JS wymagają Node.js 22.13+; projekty z pnpm używają pnpm 11.19.0. Backend wymaga Python 3.13 przy uruchomieniu poza Dockerem. Klonuj dopiero po utworzeniu potwierdzonego prywatnego repozytorium.

### Konfiguracja, uruchomienie i testy

```powershell
npm ci
npm ci --prefix server
npm test
npm run lint
npm run typecheck
npm run build
if (!(Test-Path deploy/.env)) { Copy-Item deploy/.env.example deploy/.env }
# Wypełnij zmienne w deploy/.env. Wariant domowy wymaga istniejącej sieci/bramy Caddy.
docker compose --env-file deploy/.env -p temp-mail-dev -f deploy/compose.home.yaml config --quiet
docker compose --env-file deploy/.env -p temp-mail-dev -f deploy/compose.home.yaml up -d --build
```

Wartości `.env.example` są szablonem, nie konfiguracją produkcyjną. Wypełnij lokalny `.env` niezależnymi losowymi sekretami; nie zastępuj działających kluczy bez planu rotacji. Porty i sieci produkcyjne są zajęte: używaj osobnego projektu Compose i wolnych portów. Temp Mail w wariancie domowym współdzieli bramę; pełne odizolowanie wymaga dodatkowej konfiguracji sieci i routingu. Nie wykonuj `down -v` na produkcji.

### Faktyczny stan kontroli i ograniczenia

24 testy jednostkowe PASS na oryginalnych zależnościach. Build/lint/typecheck wymagają ponownej kontroli. Odbiornik server zachowuje własną wersję 1.0.0.

Wyniki końcowe i audyt po poprawkach opisuje `KONTROLE.md`. Workflow ma uprawnienie `contents: read`, brak sekretów, przypięte Actions i osobny skan Gitleaks przed instalacją zależności. Obecność workflow nie oznacza, że CI na GitHub zostało uruchomione. Zabezpieczenia konta, prywatność zdalnego repo i zgodność SHA wymagają sprawdzenia po wysłaniu. Pierwsze wydanie 0.1.0 należy oznaczyć jako prerelease.
