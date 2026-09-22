/**
 * Runs once when the server process starts (Next.js instrumentation hook —
 * stable since Next 15, no config flag needed). Not request-scoped, so this
 * is the right place for a one-time sanity check rather than per-request
 * middleware code.
 *
 * Why this exists: Auth.js (next-auth v5) builds every absolute URL it
 * emits — the post-login redirect, the post-logout redirect, the
 * callback-url cookie — from NEXTAUTH_URL/AUTH_URL verbatim, never from the
 * incoming request's Host header (see src/auth.config.ts's trustHost
 * comment). If that value is missing, or still the "http://localhost:3000"
 * placeholder shipped in .env.example, on a real server, sign-in/out will
 * silently redirect every visitor's browser to THEIR OWN machine instead of
 * back to this app. docker-compose.yml already refuses to start without
 * NEXTAUTH_URL set at all, but a value that's merely present-but-wrong
 * (e.g. .env.example copied without editing this one line) passes that
 * check silently — this warning is what catches that case, in the logs
 * (`docker compose logs app`) right when the container starts.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") {
    return;
  }

  const configuredUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const looksLocal = !configuredUrl || /localhost|127\.0\.0\.1/.test(configuredUrl);

  if (looksLocal) {
    console.warn(
      [
        "",
        "⚠️  NEXTAUTH_URL/AUTH_URL is missing or still set to localhost while running in production.",
        "   Auth.js uses this value verbatim for every sign-in/sign-out redirect and the",
        "   callback-url cookie — it does NOT look at the request's real Host header. If it",
        "   doesn't match the URL your users actually type in their browser, login and logout",
        "   will silently redirect them to THEIR OWN machine instead of back to this server.",
        `   Current value: ${configuredUrl ?? "(not set)"}`,
        "   Fix: set NEXTAUTH_URL in your .env to this server's real public URL",
        "   (e.g. http://<your-server-ip>:3000 or https://your-domain) and restart the container.",
        "",
      ].join("\n"),
    );
  }
}
