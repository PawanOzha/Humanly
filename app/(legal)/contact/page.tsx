import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, Mail, T } from "@/components/legal/doc";

export const metadata = docMeta("/contact", "Contact", "How to reach Humanora for support, billing, privacy requests and security reports.");

export default function Contact() {
  return (
    <Doc kicker="Company" title="Contact us" updated={false} intro={<p>We&rsquo;re a small team and read every message. <T v="[TODO: typical reply time, e.g. within 2 business days]" /></p>}>
      <div className="hm-cards">
        <div className="hm-card"><h3>Support & billing</h3><p><Mail v={C.supportEmail} /></p><p>For plan, invoice and refund questions. See the <Link href="/refund">Refund Policy</Link>.</p></div>
        <div className="hm-card"><h3>Privacy & data</h3><p><Mail v={C.privacyEmail} /></p><p>Access, export or deletion requests. See the <Link href="/privacy">Privacy Policy</Link>.</p></div>
        <div className="hm-card"><h3>Security</h3><p><Mail v={C.securityEmail} /></p><p>Report a vulnerability. See <Link href="/security">Security & Trust</Link>.</p></div>
      </div>
      <h2>Postal address</h2>
      <p><T v={C.legalName} /><br /><T v={C.address} /></p>
    </Doc>
  );
}
