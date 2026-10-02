-- Ephemeral mail must not enter PostgreSQL WAL or physical replicas.
CREATE UNLOGGED TABLE IF NOT EXISTS mailboxes (
 id uuid PRIMARY KEY, address text UNIQUE NOT NULL, token_hash text UNIQUE NOT NULL,
 created_at bigint NOT NULL, expires_at bigint NOT NULL,
 CHECK (expires_at <= created_at + 86400000)
);
CREATE INDEX IF NOT EXISTS mailbox_expiry ON mailboxes(expires_at);
CREATE UNLOGGED TABLE IF NOT EXISTS messages (
 id uuid PRIMARY KEY, mailbox_id uuid NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
 sender text NOT NULL, subject text NOT NULL, received_at bigint NOT NULL,
 text_body text NOT NULL, html_body text NOT NULL, size integer NOT NULL,
 attachments jsonb NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS message_mailbox ON messages(mailbox_id,received_at);
