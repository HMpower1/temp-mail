import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
await writeFile(new URL('.env',import.meta.url),`POSTGRES_PASSWORD=${randomBytes(32).toString('hex')}\nMAIL_API_KEY=${randomBytes(32).toString('hex')}\nMAIL_DOMAIN=inbox.temp-mail.serwerbb.win\nMAIL_API_HOST=mail-api.serwerbb.win\n`,{flag:'wx',mode:0o600});
console.log('Utworzono deploy/.env. Sekrety nie zostały wyświetlone.');
