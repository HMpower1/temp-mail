# Rzeczywisty wynik kontroli â€” 2026-10-12

24/24 testy PASS; lint PASS; TypeScript PASS; build Next.js 16.3.8 PASS po poprawkach.

## Sekrety i dane

Gitleaks 8.30.1: przygotowany zestaw ĹşrĂłdeĹ‚ PASS. Wykluczono rzeczywiste .env, token DDNS, dane NAS, prywatne zasoby, bazy, kopie, zaleĹĽnoĹ›ci i wyniki buildĂłw. Szablony .env.example zawierajÄ… nazwy oraz puste wartoĹ›ci/przykĹ‚adowÄ… konfiguracjÄ™. W Temp Mail sprawdzono takĹĽe caĹ‚Ä… oryginalnÄ… historiÄ™ --all, bez wykryÄ‡. DokĹ‚adny finalny zestaw wersjonowanych plikĂłw i SHA zapisuje projects-index/MANIFESTY.json po przygotowaniu commitĂłw.

Sprawdzono pliki juĹĽ Ĺ›ledzone; .gitignore nie byĹ‚ traktowany jako dowĂłd braku sekretĂłw. Kod obejmuje przykĹ‚adowe dane testowe i publiczne treĹ›ci stron, ale nie bazy klientĂłw/uĹĽytkownikĂłw, sesje lub listy kontaktĂłw. Skaner nie gwarantuje wykrycia kaĹĽdego nietypowego sekretu ani wszystkich danych osobowych; przeglÄ…d obejmowaĹ‚ ĹşrĂłdĹ‚a/config oraz wykluczenie danych lokalnych. Nie przepisywano historii.

## ZaleĹĽnoĹ›ci

KoĹ„cowy audyt npm/pnpm: critical: 0, high: 12, moderate: 7, low: 0.
Odbiornik server: high: 1, critical: 0. Wersja pakietu pozostaje 1.0.0.

| Pakiet | Waga | Poprawka wskazana przez bazÄ™ / uwaga | ĹąrĂłdĹ‚o |
|---|---|---|---|
| `braces` | high | `{'name': 'eslint-config-next', 'version': '14.2.35', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) |
| `esbuild` | moderate | `{'name': 'drizzle-kit', 'version': '0.18.1', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| `esbuild` | moderate | `{'name': 'drizzle-kit', 'version': '0.18.1', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) |
| `image-size` | high | `{'name': 'vinext', 'version': '1.1.0', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) |
| `image-size` | high | `{'name': 'vinext', 'version': '1.1.0', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-vmh5-mc38-953g) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-p88m-4jfj-68fv) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-vxpw-j846-p89q) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-hm92-r4w5-c3mj) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-g8m3-5g58-fq7m) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-pr7r-676h-xcf6) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-8xcm-r25x-g524) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-4cwx-7wf7-3272) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-jr45-8vmc-qm54) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-35p6-xmwp-9g52) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-pmjh-fq2x-6v4x) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-r53p-7pc4-xj5r) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-rfgv-xxqx-mfg5) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-3xpg-4rpp-hhhm) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-2jfj-6hjv-fm6j) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-2gqq-gqf2-x968) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-w293-vg96-wgc3) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-8436-99hf-9mmv) |
| `undici` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-rx4f-c7p8-82vq) |
| `vite` | high | `{'name': 'vite', 'version': '8.3.4', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) |
| `vite` | high | `{'name': 'vite', 'version': '8.3.4', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) |
| `ws` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-58qx-3vcg-4xpx) |
| `ws` | high | `{'name': '@cloudflare/vite-plugin', 'version': '1.63.1', 'isSemVerMajor': False}` | [advisory](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-c7w3-x93f-qmm8) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-vvjj-xcjg-gr5g) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-268h-hp4c-crq3) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-wqvq-jvpq-h66f) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-p6gq-j5cr-w38f) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-8m3c-c648-2xjj) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-wmmp-3585-3rmp) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-2x7j-588g-ccc2) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-cc9r-2j5m-2m83) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-6vj9-mwq6-2f5v) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-8vvx-rff5-p5rq) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-v53p-9fqp-m79j) |
| `nodemailer (server)` | high | `{'name': 'nodemailer', 'version': '10.1.0', 'isSemVerMajor': True}` | [advisory](https://github.com/advisories/GHSA-r7g4-qg5f-qqm2) |

Poprawiono Next.js i eslint-config-next do 16.3.8, React/React DOM/react-server-dom-webpack do zgodnej linii 19.2.8, override sharp dla miniflare do 0.35.5 i source-map-js do 1.2.2. npm audit fix --package-lock-only --ignore-scripts bez force zastosowaĹ‚ pozostaĹ‚e poprawki zgodne z zakresami. Pliki lock zweryfikowano przez npm ci. UsuniÄ™to krytyczne zgĹ‚oszenie Next.js; aplikacja spadĹ‚a z 30 do 19 zgĹ‚oszeĹ„. Backend server nadal ma 1 HIGH dotyczÄ…ce nodemailer (zaleĹĽnoĹ›Ä‡ developerska).

PozostaĹ‚e zmiany wymagajÄ… osobnego przeglÄ…du: Cloudflare Vite Plugin 1.37 -> 1.63, Wrangler/miniflare i narzÄ™dzia Sites; przejĹ›cie vinext beta na nowsze wydanie; narzÄ™dzia drizzle/esbuild; Nodemailer 7 -> 10 w testach (zmiana major). braces pozostaje bez dostÄ™pnej poprawki z wskazanej linii. Nie stosowano proponowanego przez npm downgrade eslint-config-next do 14 ani drizzle-kit do 0.18. Nie uĹĽyto audit fix --force, legacy-peer-deps ani innych obejĹ›Ä‡ kompatybilnoĹ›ci. CI z kontrolÄ… audit-level=high bÄ™dzie blokowaĹ‚ build do rozwiÄ…zania HIGH â€” lokalne PASS testĂłw i buildĂłw nie oznacza czystego audytu.

Pliki build/*.mjs, build/*.ts i build/*.LICENSE w tym projekcie sÄ… ĹşrĂłdĹ‚ami integracji Sites i zostaĹ‚y zachowane przez wyjÄ…tki .gitignore. .openai/hosting.json to lokalna metadana narzÄ™dzia: usuniÄ™to wyĹ‚Ä…cznie Ĺ›ledzenie w kopii, zachowano plik i istniejÄ…cÄ… historiÄ™ bez przepisywania.


## Obrazy Docker i ograniczenia

Lokalny Trivy 0.75.0 przeskanowaĹ‚ obrazy bez wysyĹ‚ania kodu. Obrazy dziaĹ‚ajÄ…cych aplikacji pochodzÄ… z obecnego wdroĹĽenia, nie z poprawionych kopii ĹşrĂłdeĹ‚. SzczegĂłĹ‚owe CVE i wersje: projects-index/AUDYT-DOCKER.json, podsumowanie: projects-index/RAPORT.md. Nie restartowano produkcji, nie zmieniano sekretĂłw ani danych. Aktualizacja baz/obrazĂłw i odtwarzanie wymagajÄ… osobnego planu wdroĹĽenia. Lokalny build JS nie jest skanem nowego kompletnego obrazu produkcyjnego.

## GitHub — stan po publikacji

- Repozytorium: https://github.com/HMpower1/temp-mail — prywatność potwierdzona przez API.
- Gałąź: master; opublikowany commit wydania: 16645e4b1d88ed457fabf561bb0a027feb786840.
- Tag v0.1.0 wskazuje commit 16645e4b1d88ed457fabf561bb0a027feb786840; zgodność lokalnego i zdalnego tagu potwierdzona.
- Wydanie: https://github.com/HMpower1/temp-mail/releases/tag/v0.1.0 — prerelease.
- CI commita wydania: failure, https://github.com/HMpower1/temp-mail/actions/runs/38307144176.
- Włączone: Dependabot alerts, security updates oraz read-only workflow permissions; odczytane przez API. Secret Scanning/push protection niedostępne: Secret scanning is not available for this repository.
- Wyniki ochrony gałęzi i CI kolejnych commitów dokumentacji: aktualny RAPORT.md oraz STATUS-GITHUB.json w projects-index.

Commity dokumentacji po publikacji nie przepisują historii i nie zmieniają taga wydania. Oryginalne wdrożenie oraz dane nie były zmieniane.
