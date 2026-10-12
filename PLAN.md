# Temp Mail — stan 2026-10-03

## Produkcja
https://temp-mail.serwerbb.win — aplikacja i rzeczywisty odbiór Mailgun działają. Publiczny status: configured=true, ready=true, retencja 60 minut. Ethernet przywrócony, publiczny HTTPS dostępny. Interfejs pokazuje Oczekiwanie na wiadomości i odliczanie, bez komunikatu o niedostępnym odbiorze.

## Wykonane
- Kontynuowano istniejący Next.js/TypeScript/Tailwind + Fastify/PostgreSQL/Docker/Caddy.
- Mailgun EU: aktywne konto i domena inbox.temp-mail.serwerbb.win, poprawne MX/SPF/DKIM, catch-all forward(JSON)+stop bez store. DNS skonfigurowany przez istniejący dostęp Cloudflare; klucze tylko w deploy/.env, klucz konta nie jest przekazywany aplikacji.
- Podpis webhooka HMAC surowego body, tolerancja 5 min, transakcyjna idempotencja, limity, zapis tylko do istniejącej niewygasłej skrzynki. Brak możliwości wysyłania poczty przez aplikację. Jedna administracyjna wiadomość do własnej skrzynki służyła wyłącznie weryfikacji.
- Twarda retencja 60 minut, bez przedłużania; migracja starych rekordów, usuwanie kaskadowe treści i kluczy idempotencji, cookie 60 min. Czyszczenie co 250 ms i przed startem po awarii, PostgreSQL UNLOGGED/tmpfs bez kopii treści.
- Sanityzacja HTML i iframe sandbox bez skryptów/obrazów/formularzy; załączniki wyłącznie metadane.
- AdSlot w dwóch miejscach poza kartą adresu i wiadomościami; dokładny host + HTTPS, komplet rzeczywistych ID, Ready i opublikowany Google CMP wymagane. Consent Mode denied, tag reklam dopiero po zgodzie TCF. Aktualnie wszystkie reklamy wyłączone.
- Prywatność/cookies/regulamin zaktualizowane. ads.txt z rzeczywistego ID, bez publishera zastępczego. Wyjątek root /ads.txt, naprawiony rekord A apex i osobny DDNS; dotychczasowe przekierowanie strony głównej zachowane.

## Weryfikacja
- Lint, typecheck, build i 23 testy automatyczne przeszły przy wdrożeniu kodu; walidacja Caddy przeszła.
- Publiczny webhook: podpis 200, duplikat 200 duplicate=true, błędny podpis 401, bezpieczna treść HTML.
- Po aktywacji konta i przywróceniu Ethernet realna wiadomość przez Mailgun: przyjęta przez provider 200, odebrana w aplikacji, poprawny tekst, HTML bez trackera, jedna wiadomość, usunięcie skrzynki testowej.
- Po MAIL_INGRESS_READY=true i restarcie receiver: publiczny status ready=true, nowa skrzynka deliveryReady=true, ważność 60 minut. Publiczny cykl tworzenie/lista/brak przedłużenia/usunięcie/410 przeszedł. Jednorazowy 503 podczas startu kontenera ustąpił po jego uruchomieniu.
- Publiczny interfejs w przeglądarce potwierdzony: adres wygenerowany, Oczekiwanie na wiadomości, zegar, brak fałszywego ostrzeżenia.

## Pozostało — AdSense
Publisher NEXT_PUBLIC_ADSENSE_CLIENT został dostarczony i wdrożony. Pozostały dwa sloty, status Ready, opublikowany/przetestowany Google Privacy & Messaging oraz dane operatora i kontakt w polityce. Instrukcja ADSENSE_SETUP.md. Bez tych warunków reklamy pozostają wyłączone; zatwierdzenie zależy od Google.

## Granice retencji
Dostęp kończy się dokładnie po 60 minutach; fizyczne czyszczenie co 250 ms, po awarii przed startem. Kolejki/logi providera podlegają jego umowie, a nie timerowi aplikacji. Nie deklarujemy ich usunięcia w 60 minut.

## Weryfikacja AdSense — 2026-10-03
Publisher ca-pub-2447634478924942 zapisany jako zmienna środowiskowa. Root i subdomena /ads.txt zwracają 200 text/plain z rzeczywistym wpisem. Metatag google-adsense-account w head tylko dla dokładnej subdomeny; bez tagu na localhost/preview/apex/www. Kod reklamowy pozostaje niezaładowany, API ads config=null, enabled=false. Lint, typecheck, build i 24 testy przeszły, publiczny cykl skrzynki również. Użytkownik może wybrać w AdSense weryfikację ads.txt i poprosić o przegląd; Ready nie jest potwierdzone.

## Nowy wymóg biznesowy użytkownika — dostęp finansowany reklamami
Użytkownik chce, aby generowanie tymczasowej skrzynki wymagało wyświetlania reklam. To zmiana wcześniejszego zachowania, gdzie odmowa zgody nie ograniczała dostępu. CMP z trzema opcjami pozostaje wymagane; odmowa personalizacji i blokowanie reklam są odrębnymi stanami. Do przygotowania po potwierdzeniu Ready i slotów: obsługa reklam ograniczonych na podstawie sygnałów CMP oraz bramka tworzenia skrzynki, z odrębną obsługą adblocka, braku wypełnienia i awarii. Nie wymagać kliknięć ani wymuszać zgody na personalizację. Nie ogłaszać gwarancji dostarczenia reklamy przez Google. Na tym etapie reklamy i bramka nie są włączone; status Ready, sloty i publikacja CMP nadal niepotwierdzone.
