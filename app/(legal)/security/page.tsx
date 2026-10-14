import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, Mail } from "@/components/legal/doc";

export const metadata = docMeta("/security", "Security & Trust", "How Humanora protects accounts, text and payments: hashed passwords and API keys, short-lived sessions, minimal Google permissions and no card data on our servers.");

export default function Security() {
  return (
    <Doc kicker="Trust" title="Security & Trust" intro={<p>You trust us with your writing. This page lists the concrete measures we use today. We have not yet completed any third-party security certification, and we will only claim one once we have it.</p>}>
      <div className="hm-cards">
        <div className="hm-card"><h3>Never used for training</h3><p>Text you submit is never used to train AI models. It is processed by our own model, not a third-party AI API.</p></div>
        <div className="hm-card"><h3>No Gmail access</h3><p>Google sign-in asks only for your basic profile and email address. We cannot read your mail, contacts or files.</p></div>
        <div className="hm-card"><h3>No card data</h3><p>Payments go through Paddle. Card details never touch our servers.</p></div>
        <div className="hm-card"><h3>Your text, your control</h3><p>Delete any document, or your whole account, from inside the app.</p></div>
        <div className="hm-card"><h3>No ad trackers</h3><p>No advertising cookies, no third-party analytics, and we don&rsquo;t sell data.</p></div>
      </div>

      <h2>Accounts and sign-in</h2>
      <ul>
        <li>Passwords are stored only as Argon2 hashes.</li>
        <li>Sign in with Google uses the OpenID Connect authorization-code flow with PKCE.</li>
        <li>Sessions use short-lived access tokens (15 minutes) and rotating refresh tokens, stored only as hashes, in HttpOnly cookies.</li>
        <li>You can see your active sessions and sign out of all of them at once.</li>
        <li>Sign-up and log-in are rate limited and protected by Cloudflare Turnstile against bots.</li>
      </ul>

      <h2>API keys</h2>
      <ul>
        <li>Keys are shown once. We store only a keyed hash (HMAC-SHA256) and the last 4 characters.</li>
        <li>Keys can be scoped, given an expiry, rotated with a grace period, and revoked at any time.</li>
      </ul>

      <h2>Infrastructure</h2>
      <ul>
        <li>All traffic is encrypted with HTTPS and served through Cloudflare.</li>
        <li>Payment webhooks are signature-verified before they change anything.</li>
        <li>After 30 days with no sign-in or use, your documents, rewrite history, session records and API usage logs are deleted automatically. Your account and plan stay so you can come back.</li>
        <li>Deleting your account (confirmed with your password, or by signing in to Google again) removes your documents, rewrite history, API keys, sessions and Google connection from our database.</li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>If you find a security issue, email <Mail v={C.securityEmail} /> with the details. Please give us reasonable time to fix it before disclosing it publicly. We won&rsquo;t take action against good-faith research that avoids harming users or their data.</p>

      <p>More detail on data handling: <Link href="/privacy">Privacy Policy</Link>.</p>
    </Doc>
  );
}
