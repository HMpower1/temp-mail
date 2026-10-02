declare namespace Cloudflare {
  interface Env {
    MAIL_API_ORIGIN?: string;
    MAIL_API_KEY?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
