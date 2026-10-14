import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, Mail, T } from "@/components/legal/doc";

export const metadata = docMeta("/terms", "Terms of Service", "The terms for using Humanora's AI detector, humanizer and API, including acceptable use, plans and billing, and limits of liability.");

export default function Terms() {
  return (
    <Doc kicker="Legal" title="Terms of Service" intro={<p>These terms are an agreement between you and <T v={C.legalName} /> (&ldquo;Humanora&rdquo;, &ldquo;we&rdquo;) for using humanora.app, app.humanora.app and the Humanora API (the &ldquo;Service&rdquo;). By using the Service you accept them.</p>}>
      <h2>1. The Service</h2>
      <p>Humanora scores text for AI-like writing patterns and rewrites it in a more natural voice. AI-detection scores are estimates, not proof of how a text was written, and rewrites can contain mistakes. Check every result before you rely on it.</p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least <T v={C.minAge} /> years old, and old enough to agree to these terms where you live.</li>
        <li>Give accurate information and keep your password and API keys secret. You are responsible for activity under your account and keys.</li>
        <li>One person, one free account. Creating accounts to get extra free usage is not allowed.</li>
      </ul>

      <h2 id="acceptable-use">3. Acceptable use</h2>
      <p>You may not use Humanora to:</p>
      <ul>
        <li>break the law, or the rules of a school, employer, publisher or exam that apply to you, including submitting work as your own where that is not allowed;</li>
        <li>create spam, scams, phishing, fake reviews, disinformation or content meant to deceive people about who wrote it in harmful ways;</li>
        <li>process content you have no right to use, or that infringes someone else&rsquo;s rights;</li>
        <li>submit illegal content, content that sexualises minors, or content that harasses or threatens people;</li>
        <li>probe, overload or attack the Service, get around usage limits, or scrape or resell it without permission;</li>
        <li>use the outputs to build a competing model or service.</li>
      </ul>
      <p>You are responsible for how you use the output. We may suspend accounts that break these rules.</p>

      <h2>4. Your content</h2>
      <p>You keep all rights to the text you submit and to the output. You give us a limited licence to process and store it only to provide the Service to you. See the <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>5. Plans, billing and cancellation</h2>
      <ul>
        <li>Paid plans are billed in advance, monthly or yearly, and renew automatically until cancelled. Prices are shown on the <Link href="/#pricing">pricing section</Link>.</li>
        <li>Our order process is run by our online reseller Paddle.com, which is the merchant of record for all our orders. Paddle handles payments, tax, invoices and billing customer service, and its <a href="https://www.paddle.com/legal/checkout-buyer-terms" rel="noopener">buyer terms</a> apply to your purchase.</li>
        <li>You can cancel at any time in the app&rsquo;s billing settings. You keep access until the end of the paid period.</li>
        <li>Unused words do not roll over unless the plan says so. Free usage limits can change.</li>
        <li>Refunds: see the <Link href="/refund">Refund Policy</Link>.</li>
      </ul>

      <h2>6. API</h2>
      <p>API use is covered by these terms and the API documentation, including rate and usage limits. Do not share keys; rotate any key you think is exposed.</p>

      <h2>7. Availability and changes</h2>
      <p>We work to keep Humanora running but do not promise it will always be available or error-free. We may change or discontinue features. We will give reasonable notice of material changes to paid plans.</p>

      <h2>8. Ending use</h2>
      <p>You can delete your account at any time. We may suspend or end access for serious or repeated breaches of these terms, or where the law requires it.</p>

      <h2>9. Disclaimers</h2>
      <p>To the extent the law allows, the Service is provided &ldquo;as is&rdquo; without warranties of any kind, including fitness for a particular purpose. We do not guarantee that text will pass or fail any third-party AI detector.</p>

      <h2>10. Limitation of liability</h2>
      <p>To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits rights you have as a consumer that cannot be limited by law.</p>

      <h2>11. Law</h2>
      <p>These terms are governed by the laws of <T v={C.jurisdiction} />, except where consumer law in your country gives you other rights.</p>

      <h2>12. Contact</h2>
      <p><T v={C.legalName} />, <T v={C.address} />. Email: <Mail v={C.supportEmail} />.</p>
    </Doc>
  );
}
