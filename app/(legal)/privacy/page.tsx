import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, Mail, T } from "@/components/legal/doc";

export const metadata = docMeta("/privacy", "Privacy Policy", "What Humanora collects when you use the site, the app and the API, why, who processes it, how long it is kept, and how to export or delete it.");

export default function Privacy() {
  return (
    <Doc kicker="Legal" title="Privacy Policy" intro={<p>This policy explains what personal data Humanora collects, why, who else handles it, and the choices you have. It covers humanora.app, the app at app.humanora.app and the Humanora API. Humanora is operated by <T v={C.legalName} />, <T v={C.address} /> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).</p>}>
      <h2>The short version</h2>
      <ul>
        <li>We collect what we need to run your account: your name, email address and, if you use Google sign-in, your Google profile name and photo.</li>
        <li>We ask Google only for <code>openid email profile</code>. We <strong>cannot read your Gmail</strong>, contacts, Drive or anything else in your Google account.</li>
        <li>Text you paste is processed to detect and rewrite it. For signed-in users it is saved as documents until you delete them.</li>
        <li>Payments are handled by Paddle. We never see or store your card number.</li>
        <li>We do not sell your personal data and we do not use advertising trackers.</li>
      </ul>

      <h2>1. Data we collect</h2>
      <table>
        <thead><tr><th>Data</th><th>When</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>Name and email address</td><td>When you create an account</td><td>To identify your account, sign you in and contact you about it</td></tr>
          <tr><td>Password (stored only as an Argon2 hash)</td><td>Email and password sign-up</td><td>To sign you in. We cannot see your password.</td></tr>
          <tr><td>Google account ID, email, name, given name and profile photo URL</td><td>Sign in with Google</td><td>To link your Google login to your Humanora account and show your name and photo</td></tr>
          <tr><td>Profile photo</td><td>If you upload one, or from your Google profile</td><td>To show your avatar in the app</td></tr>
          <tr><td>Text you submit, rewritten output, AI-detection results and document titles</td><td>When you use the detector, humanizer, file upload or API</td><td>To provide the service. Signed-in users&rsquo; documents are saved so you can come back to them.</td></tr>
          <tr><td>Word usage and credit balance</td><td>When you run checks or rewrites</td><td>To apply plan limits and show your usage</td></tr>
          <tr><td>Session data: IP address, browser user agent, sign-in and last-used times</td><td>Each sign-in</td><td>To keep you signed in, let you see and sign out other sessions, and protect your account</td></tr>
          <tr><td>Device identifier, IP address and a hash of your email at sign-up</td><td>Account creation</td><td>To prevent abuse of free plans (for example mass account creation)</td></tr>
          <tr><td>Billing records: Paddle customer and subscription IDs, plan, status and billing email</td><td>When you subscribe</td><td>To give you the plan you paid for</td></tr>
          <tr><td>API key metadata: name, last 4 characters, request and word counts per day, last-used time and IP</td><td>When you use the API</td><td>To run the API, show usage and detect misuse. The key itself is stored only as a keyed hash.</td></tr>
          <tr><td>Security and audit logs (for example sign-ins, key changes, account deletion)</td><td>Ongoing</td><td>To secure the service and investigate problems</td></tr>
          <tr><td>Your settings (default tone and level)</td><td>When you change them</td><td>To remember your preferences</td></tr>
        </tbody>
      </table>
      <p>Visitors who try the free checker on the homepage without an account: the text is sent to our servers to be scored and rewritten, and a cookie plus your network address are used to count free checks. We do not ask for your name or email.</p>

      <h2>2. How we use your text</h2>
      <p>Your text is sent to our writing model to score and rewrite it. The model runs at: <T v={C.modelHosting} />.</p>
      <p>Training: <T v="[TODO: state clearly whether submitted text is ever used to train or improve models. If not, say: 'We do not use your text to train models.']" /></p>
      <p>We do not publish your text, and staff access it only when needed to operate the service, fix a problem you report, or comply with the law.</p>

      <h2>3. Legal bases (EEA/UK users)</h2>
      <ul>
        <li><strong>Contract</strong>: running your account, processing your text, billing.</li>
        <li><strong>Legitimate interests</strong>: security, fraud and abuse prevention, keeping the service working.</li>
        <li><strong>Consent</strong>: the optional homepage cookie for extra free checks. You can decline it.</li>
        <li><strong>Legal obligation</strong>: tax and accounting records.</li>
      </ul>

      <h2>4. Who else processes data</h2>
      <table>
        <thead><tr><th>Provider</th><th>What they do</th><th>Data involved</th></tr></thead>
        <tbody>
          <tr><td>Paddle</td><td>Payment processing, tax and invoicing. Paddle is the merchant of record for purchases.</td><td>Billing details, email, payment method (held by Paddle, not us)</td></tr>
          <tr><td>Google</td><td>Optional &ldquo;Sign in with Google&rdquo;</td><td>Sign-in request; Google returns your basic profile to us</td></tr>
          <tr><td>Cloudflare</td><td>Network delivery, DDoS protection and the Turnstile bot check on sign-up and log-in</td><td>IP address, request metadata, browser signals for the bot check</td></tr>
          <tr><td>Google Fonts</td><td>Fonts on humanora.app</td><td>Your IP address and browser details when the font files load</td></tr>
          <tr><td>Hosting and database</td><td>Runs the app and stores data in <T v={C.dbRegion} /></td><td>All account data described above</td></tr>
        </tbody>
      </table>
      <p>We do not sell or rent personal data and we do not share it for cross-context advertising.</p>

      <h2>5. Retention</h2>
      <ul>
        <li><strong>Account, documents, API keys and sessions</strong>: kept while your account exists. Deleting a document removes it. Deleting your account removes all of these.</li>
        <li><strong>Sessions</strong>: expire after 12 hours, or 30 days with &ldquo;remember me&rdquo;.</li>
        <li><strong>After account deletion</strong> we keep a one-way hash of your email address with your remaining free-word balance, and sign-up records (IP, device ID, hashed email), so deleting and re-creating an account cannot reset free limits. These hold no readable email address.</li>
        <li><strong>Billing records</strong>: kept as long as tax and accounting law requires. Paddle keeps its own records under its privacy policy.</li>
        <li><strong>Logs</strong>: <T v={C.logRetention} />.</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>Depending on where you live (for example under the GDPR, UK GDPR or California&rsquo;s CCPA/CPRA), you can ask to access, correct, export or delete your personal data, object to or restrict some processing, and withdraw consent. You will not be treated differently for using these rights.</p>
      <ul>
        <li><strong>Correct</strong>: change your name, photo and settings in the app.</li>
        <li><strong>Delete documents</strong>: delete them one by one in the app.</li>
        <li><strong>Delete your account</strong>: Settings → Account → Delete account. Cancel any active subscription first so you are not charged again. If you cannot delete it yourself, email <Mail v={C.privacyEmail} /> from the account&rsquo;s address and we will do it.</li>
        <li><strong>Disconnect Google</strong>: you can also remove Humanora at <a href="https://myaccount.google.com/connections" rel="noopener">myaccount.google.com/connections</a>.</li>
        <li><strong>Access or export</strong>: email <Mail v={C.privacyEmail} />. We reply within 30 days.</li>
      </ul>
      <p>You may also complain to your local data protection authority.</p>

      <h2>7. Security</h2>
      <p>See our <Link href="/security">Security page</Link> for how we protect data. No system is perfectly secure, and we will notify affected users of a breach as the law requires.</p>

      <h2>8. International transfers</h2>
      <p>Our providers may process data outside your country. Where the law requires it, transfers rely on safeguards such as the European Commission&rsquo;s Standard Contractual Clauses offered by those providers.</p>

      <h2>9. Children</h2>
      <p>Humanora is not for children under <T v={C.minAge} />. We do not knowingly collect their data; contact us and we will delete it.</p>

      <h2>10. Cookies</h2>
      <p>See the <Link href="/cookies">Cookie Policy</Link>.</p>

      <h2>11. Changes</h2>
      <p>We will update the date above when this policy changes and tell signed-in users by email or in the app about material changes.</p>

      <h2>12. Contact</h2>
      <p><T v={C.legalName} />, <T v={C.address} />. Email: <Mail v={C.privacyEmail} />.</p>
    </Doc>
  );
}
