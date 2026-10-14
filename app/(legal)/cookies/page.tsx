import Link from "next/link";
import { Doc, docMeta } from "@/components/legal/doc";

export const metadata = docMeta("/cookies", "Cookie Policy", "The small set of cookies and local storage Humanora uses: sign-in, security and your free-check choice. No advertising trackers.");

export default function Cookies() {
  return (
    <Doc kicker="Legal" title="Cookie Policy" intro={<p>Humanora uses a few cookies that are needed to sign you in and keep your account safe, plus one optional cookie on the homepage. We do not use advertising or cross-site tracking cookies, and we do not run third-party analytics.</p>}>
      <h2>Cookies we set</h2>
      <table>
        <thead><tr><th>Purpose</th><th>Type</th><th>Lasts</th></tr></thead>
        <tbody>
          <tr><td>Access token: proves you are signed in</td><td>Essential, HttpOnly</td><td>15 minutes</td></tr>
          <tr><td>Refresh token: keeps you signed in</td><td>Essential, HttpOnly</td><td>Browser session, or 30 days with &ldquo;remember me&rdquo;</td></tr>
          <tr><td>Device identifier: abuse and fraud prevention at sign-up and sign-in</td><td>Essential, HttpOnly</td><td>400 days</td></tr>
          <tr><td>Google sign-in state: protects the Google login round-trip</td><td>Essential, HttpOnly</td><td>A few minutes, during sign-in only</td></tr>
          <tr><td>Free-check choice on humanora.app: remembers whether you accepted, and counts free checks</td><td>Optional (you choose)</td><td>180 days</td></tr>
        </tbody>
      </table>
      <p>The free-check choice is also saved in your browser&rsquo;s local storage. If you decline, you keep one free check and the choice is remembered so we don&rsquo;t ask again.</p>

      <h2>Third parties</h2>
      <ul>
        <li><strong>Cloudflare</strong> may set security cookies and runs Turnstile, a bot check, on sign-up and log-in.</li>
        <li><strong>Paddle</strong> sets its own cookies inside the checkout window when you buy a plan.</li>
        <li><strong>Google</strong> sets its own cookies on Google&rsquo;s pages if you use Sign in with Google.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>You can delete or block cookies in your browser settings. Blocking essential cookies will stop sign-in from working. To change your homepage choice, clear cookies and local storage for humanora.app.</p>
      <p>More on how we handle data: <Link href="/privacy">Privacy Policy</Link>.</p>
    </Doc>
  );
}
