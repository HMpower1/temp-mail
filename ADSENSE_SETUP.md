# AdSense — domyślnie wyłączone

Reklamy mogą działać wyłącznie na HTTPS `temp-mail.serwerbb.win`, po statusie **Ready** w AdSense. Publisher ca-pub-2447634478924942 został dostarczony i zapisany w środowisku produkcyjnym. Root oraz subdomena ads.txt opublikowane i zweryfikowane HTTP 200. Metatag w head subdomeny wdrożony. Brakuje dwóch slotów, potwierdzenia Ready i opublikowanego/przetestowanego komunikatu CMP. Kod reklamowy pozostaje wyłączony.

W AdSense dodaj witrynę, uzupełnij dane operatora i kontakt w polityce prywatności, uzyskaj Ready, utwórz dwa responsywne sloty i opublikuj europejski komunikat **Google Privacy & Messaging**, certyfikowany CMP, dla EOG, UK i Szwajcarii. Zweryfikuj kod komunikatu i TCF w przeglądarce przed włączeniem. Wyłącz Auto ads; aplikacja używa wyłącznie dwóch ręcznych slotów, poza treścią poczty i przyciskami.

W `deploy/.env` ustaw rzeczywiste wartości `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_TOP`, `NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM`. Dopiero po weryfikacji ustaw `ADSENSE_SITE_STATUS=Ready`, `ADSENSE_CMP_PUBLISHED=true`, `ADSENSE_ENABLED=true` i odtwórz kontener web. Flag nie ustawia automatycznie żadna procedura wdrożenia.

Bez kompletu ustawień komponent renderuje null i nie pobiera żadnych skryptów Google. Najpierw Consent Mode denied i CMP, potem dopiero tag reklamowy po zgodzie TCF na przechowywanie i personalizację oraz Google (vendor 755). Brak lub nieznana zgoda blokuje wszystkie reklamy, również poza obszarem TCF. Wycofanie zgody powoduje denied i przeładowanie, a ustawienia CMP są dostępne na stronie. Obsługę prawdziwego komunikatu i reklam trzeba przetestować dopiero po uzyskaniu konta i statusu Ready.

`/ads.txt` generuje `google.com, pub-[rzeczywisty numer], DIRECT, f08c47fec0942fa0` wyłącznie z prawidłowego NEXT_PUBLIC_ADSENSE_CLIENT. Bez ID zwraca komentarz, bez fałszywego sprzedawcy. `subdomain=temp-mail.serwerbb.win` wskazuje subdomenę. Domena główna ma odrębny routing Caddy: wyjątek dla dokładnego `/ads.txt` przekierowuje do `https://temp-mail.serwerbb.win/ads.txt`; pozostały ruch zachowuje dotychczasowe przekierowanie. Na domenie głównej nie ma kodu reklamowego. Alternatywnie na innym hostingu publikuj treść odpowiedzi aplikacji jako fizyczny `/ads.txt`, pozostawiając ewentualne istniejące wpisy innych publisherów.

Weryfikacja: https://serwerbb.win/ads.txt musi zakończyć się 200 text/plain z rzeczywistym wpisem po dodaniu ID. Sprawdź odmowę, przyznanie i wycofanie zgody, brak żądań reklamowych na localhost/preview/apex/www, układ mobilny oraz brak Auto ads.

Źródła: https://support.google.com/adsense/answer/13554116 ; https://developers.google.com/funding-choices/fc-api-docs ; https://support.google.com/adsense/answer/9785052

## Następny krok użytkownika
AdSense → Witryny → serwerbb.win → metoda ads.txt → Zweryfikuj → Poproś o weryfikację. Nie wybieraj wstawienia skryptu reklamowego do domeny głównej. Weryfikacja ads.txt działa bez ładowania reklam. Następnie Google CMP w Prywatność i wyświetlanie wiadomości, Rozporządzenia europejskie, z linkiem https://temp-mail.serwerbb.win/prywatnosc i możliwością odmowy. Auto ads wyłączone. Po zatwierdzeniu Ready potrzebne dwa rzeczywiste data-ad-slot z responsywnych jednostek displayowych.
