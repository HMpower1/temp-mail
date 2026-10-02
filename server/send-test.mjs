import nodemailer from 'nodemailer';
const address=process.argv[2];
if(!address||!address.endsWith('@inbox.temp-mail.serwerbb.win'))throw new Error('Use a Temp Mail test mailbox');
const transport=nodemailer.createTransport({host:'127.0.0.1',port:25,secure:false,ignoreTLS:true});
await transport.sendMail({from:'Test Temp Mail <test@example.com>',to:address,subject:'Twoja skrzynka działa ✨',text:'To wiadomość testowa dostarczona przez lokalny serwer SMTP.\n\nTreść HTML jest oczyszczana, a zewnętrzne obrazy i skrypty blokowane.\nWiadomość zniknie razem ze skrzynką.',html:'<h2>Twoja skrzynka działa</h2><p>Ta wiadomość przeszła przez serwer SMTP i trafiła do Twojej tymczasowej skrzynki.</p><p><strong>Bezpieczny podgląd HTML</strong> działa w odizolowanym oknie.</p><script>alert("XSS")</script><img src="https://example.com/tracker.gif">'});
transport.close();console.log('SMTP accepted the test message.');
