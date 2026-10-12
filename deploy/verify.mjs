// Run after DNS and the receiver are operational. No secret is needed.
const origin=process.argv[2] || 'https://temp-mail.serwerbb.win';
const box=await fetch(`${origin}/api/mailbox`,{method:'POST',headers:{Origin:origin}});
if(!box.ok) throw new Error(`Create failed: HTTP ${box.status}`);
const cookie=box.headers.get('set-cookie')?.split(';')[0];
if(!cookie) throw new Error('No mailbox cookie');
const data=await box.json();
console.log(`Created ${data.address}; expires ${new Date(data.expiresAt).toISOString()}`);
const inbox=await fetch(`${origin}/api/messages`,{headers:{Cookie:cookie}});
if(!inbox.ok)throw new Error(`Inbox failed: HTTP ${inbox.status}`);
const extended=await fetch(`${origin}/api/mailbox/extend`,{method:'POST',headers:{Origin:origin,Cookie:cookie}});
if(extended.status!==409)throw new Error('Mailbox must not exceed 60 minutes');
const deleted=await fetch(`${origin}/api/mailbox`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie}});
if(!deleted.ok)throw new Error('Delete failed');
if((await fetch(`${origin}/api/messages`,{headers:{Cookie:cookie}})).status!==410)throw new Error('Deleted mailbox still accessible');
console.log('PASS: create, inbox, 60-minute limit, deletion and isolation after deletion');
