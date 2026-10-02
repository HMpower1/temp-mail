# Temp Mail

Adres: https://temp-mail.serwerbb.win. Frontend i API działają na istniejącym hostingu Docker. Odbiór z internetu wymaga dostępnego TCP/25; `MAIL_INGRESS_READY=false` powoduje jawne ostrzeżenie w interfejsie.

## Stack i bezpieczeństwo

Next.js 16, React 19, TypeScript, Tailwind CSS; Fastify, PostgreSQL 17, smtp-server, mailparser i sanitize-html. Docker Compose, Caddy / Let's Encrypt oraz DNS Cloudflare z osobnym DDNS. Wyłącznie odbiór poczty: brak wysyłania, logowania SMTP i relaying. Nieznani odbiorcy są odrzucani podczas RCPT TO.

Sekret dostępu 256-bitowy znajduje się w cookie Secure/HttpOnly/SameSite=Strict; baza przechowuje tylko SHA-256. Sekret API pozostaje w prywatnej sieci Docker. HTML jest oczyszczany i wyświetlany w iframe `sandbox=""` z dodatkową CSP. Skrypty, obrazy, odnośniki i formularze są usuwane. Nazwy załączników są wyświetlane jako tekst; ich zawartość jest odrzucana.

## Retencja

Serwer blokuje dostęp i odbiór dokładnie w `expires_at`: 3600000 ms od utworzenia, chyba że użytkownik przedłuży ważność do maksymalnie 24 h od utworzenia. Zapisy SMTP ponownie sprawdzają czas po zakończeniu transmisji.

Fizyczne czyszczenie rekordów działa co 250 ms, przed odczytem oraz przy starcie. Obciążenie lub awaria mogą je opóźnić; nie jest to gwarancja wymazania w tej samej milisekundzie. Usunięcie skrzynki kaskadowo usuwa wiadomości. PostgreSQL używa tabel UNLOGGED i tmpfs bez trwałego wolumenu: restart bazy usuwa wszystkie skrzynki. Nie twórz kopii tej bazy, snapshotów RAM, core dumpów ani niezaszyfrowanego swapu. Infrastruktura może zachowywać własne dzienniki techniczne.

## Uruchomienie i aktualizacja

Node.js >=22.13, npm, Docker Compose z obsługą `!override`.

```powershell
npm ci
npm run build
cd server
npm ci
npm test
cd ..
node deploy/setup-env.mjs
docker compose -p temp-mail --env-file deploy/.env -f deploy/compose.home.yaml -f deploy/smtp.override.yaml up -d --build
```

Generator sekretów nie nadpisuje istniejącego pliku i nie wyświetla wartości. `deploy/.env` nie jest częścią archiwum źródeł. Wariant produkcyjny `compose.home.yaml` wykorzystuje sieć `caddy_default`; wpis proxy jest w `deploy/caddy.home.block`. `compose.yaml` jest alternatywą dla osobnego odbiornika/API z Caddy. Źródła mają także opcjonalną adaptację Worker, lecz domena produkcyjna działa na istniejącym serwerze.

Aktualizacja aplikacji: `npm run build`, potem powtórz komendę `up -d --build`. Aktualizacja frontendu nie usuwa skrzynek; restart PostgreSQL usuwa dane. Nie loguj treści, cookie, X-API-Key ani SMTP DATA.

## Zmienne

| Zmienna | Gdzie i znaczenie |
|---|---|
| POSTGRES_PASSWORD | Compose: wygenerowane hasło PostgreSQL |
| DATABASE_URL | Odbiornik: Compose buduje połączenie automatycznie |
| MAIL_API_KEY | Web i odbiornik: ten sam losowy sekret, minimum 32 znaki |
| MAIL_DOMAIN | Odbiornik: inbox.temp-mail.serwerbb.win |
| MAIL_API_ORIGIN | Web: http://receiver:8080 w prywatnej sieci lub HTTPS API |
| SITE_ORIGIN | Next.js: https://temp-mail.serwerbb.win; stałe źródło dla CSRF |
| MAIL_INGRESS_READY | Odbiornik: true dopiero po zewnętrznym teście SMTP |
| CLOUDFLARE_TOKEN_FILE | DDNS: ścieżka istniejącego pliku tokenu montowanego read-only |
| PORT / SMTP_PORT | Opcjonalnie: 8080 / 2525; host mapuje SMTP na TCP/25 |

Nie stosuj NEXT_PUBLIC_ dla sekretów. Nie zapisuj ich w Git ani dziennikach.

## DNS i sieć

| Typ | Nazwa | Wartość |
|---|---|---|
| A | temp-mail.serwerbb.win | publiczne IPv4, DNS only |
| A | mx-temp.serwerbb.win | publiczne IPv4, DNS only |
| MX | inbox.temp-mail.serwerbb.win | priorytet 10, mx-temp.serwerbb.win |
| TXT | inbox.temp-mail.serwerbb.win | v=spf1 -all |
| TXT | _dmarc.inbox.temp-mail.serwerbb.win | v=DMARC1; p=reject |

Osobny DDNS aktualizuje tylko obydwa rekordy A tej aplikacji. Odbiór wymaga przekierowania routera TCP/25 na `192.168.1.36:25` oraz dopuszczenia ruchu w zaporze. HTTP/HTTPS wykorzystują istniejące przekierowania. SMTP w tej wersji nie reklamuje STARTTLS; nie włączaj MTA-STS wymagającego TLS bez dodania certyfikatu SMTP.

## Limity

10 nowych skrzynek na godzinę i 180 żądań API na minutę na klienta. 2 MB na wiadomość, 1 MB na załącznik, do 10 załączników. 100 wiadomości i 20 MB na skrzynkę. 50 połączeń SMTP równocześnie, limity na IP, jeden odbiorca na transmisję. Limiter ma ograniczoną pamięć i działa w pojedynczej instancji; przed skalowaniem horyzontalnym dodaj wspólny limiter.

## Testy

14 testów obejmuje unikalność, izolację, dokładną granicę wygaśnięcia, 24 h, usuwanie kaskadowe, rozmiary i pojemność, XSS, ograniczenia ruchu, klucz API, realną sesję SMTP, CSRF i tajne cookie. PGlite uruchamia silnik PostgreSQL; dodatkowy test produkcyjny wykorzystuje kontener PostgreSQL 17.

```powershell
node deploy/verify.mjs
node server/verify-production.mjs
```

Pierwsza komenda sprawdza publiczne utworzenie, listę, przedłużenie i usunięcie. Druga dostarcza test przez **lokalny** SMTP do produkcyjnej bazy, odczytuje go publicznym API i usuwa skrzynkę. To nie potwierdza dostarczania przez zewnętrzny MTA. Osobno sprawdź TCP/25 z zewnątrz i odbierz wiadomość od zewnętrznego nadawcy.

Po pozytywnej weryfikacji ustaw `MAIL_INGRESS_READY=true` w `deploy/.env` i wykonaj:

```powershell
docker compose -p temp-mail --env-file deploy/.env -f deploy/compose.home.yaml -f deploy/smtp.override.yaml up -d receiver
```

Stan i logi: `docker compose ... ps`, `docker logs temp-mail-receiver-1 --tail 30`, `docker logs temp-mail-web-1 --tail 30`. Kopia konfiguracji Caddy sprzed wdrożenia jest w katalogu roboczym zadania.
