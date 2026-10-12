# Odbiór Mailgun EU — działa, 2026-10-03

Konto aktywne, domena inbox.temp-mail.serwerbb.win zweryfikowana. MX, SPF i DKIM mają valid=valid. Catch-all przekazuje JSON na https://temp-mail.serwerbb.win/api/webhooks/mailgun/json, potem stop(), bez store(). Klucz konta i signing key zapisane wyłącznie w deploy/.env. MAIL_INGRESS_READY=true po udanym realnym odbiorze. Nie brakuje danych dostępowych do poczty.

## Aktualne DNS
- MX inbox.temp-mail.serwerbb.win, priorytet 10: mxa.eu.mailgun.org
- MX inbox.temp-mail.serwerbb.win, priorytet 10: mxb.eu.mailgun.org
- TXT inbox.temp-mail.serwerbb.win: v=spf1 include:mailgun.org ~all
- TXT email._domainkey.inbox.temp-mail.serwerbb.win: rzeczywisty publiczny DKIM zapisany w deploy/mailgun-dns.json.
- CNAME email.inbox.temp-mail.serwerbb.win: eu.mailgun.org (DNS-only, opcjonalny tracking, nieużywany do odbioru).
- TXT _dmarc.inbox.temp-mail.serwerbb.win: v=DMARC1; p=reject

## Potwierdzone
Publiczny podpisany webhook 200, duplikat 200 duplicate=true, błędny podpis 401. Realna wiadomość techniczna przyjęta przez Mailgun i odebrana w aplikacji; tekst zgodny, HTML bez obrazów/skryptów, jedna wiadomość, skrzynka testowa usunięta. Po restarcie publiczny /api/status ready=true, nowa skrzynka deliveryReady=true. Interfejs pokazuje Oczekiwanie na wiadomości.

## Utrzymanie
Serwer musi mieć działający Ethernet i publiczny HTTPS. Nie potrzeba publicznego TCP/25. SMTP do lokalnych testów tylko 127.0.0.1:2525. Aktualizacja: docker compose -p temp-mail --env-file deploy/.env -f deploy/compose.home.yaml up -d --build. Nie używaj smtp.override.yaml.

scripts/setup-mailgun.mjs jest idempotentnym provisioningiem domeny/DNS/routes; ponowne wykonanie ustawia MAIL_INGRESS_READY=false do następnego testu rzeczywistego odbioru. Nie uruchamiaj go przy zwykłym restarcie. Sekret podpisów aktualizuj w receiver przy rotacji. Publiczny status nie ujawnia sekretów. Nie publikuj deploy/.env.

Limity: HTTP 4 MiB, treść 2 MiB, załącznik 1 MiB, 10 załączników, 100 wiadomości/20 MiB na skrzynkę. HMAC-SHA256(timestamp+raw body), tolerancja 5 minut. Zapis tylko do aktywnej skrzynki, transakcyjna idempotencja, HTML sanityzowany i izolowany. 406 dla nieaktywnej skrzynki/limitów, 503 dla awarii. Aplikacja nie wysyła e-maili.

Dostęp kończy się po 60 minutach; fizyczne kasowanie co 250 ms i przed startem po awarii. PostgreSQL tmpfs/UNLOGGED bez kopii treści. Retencja kolejki/logów Mailgun podlega jego umowie; wygasłe adresy odrzucane bez odtwarzania skrzynki.
