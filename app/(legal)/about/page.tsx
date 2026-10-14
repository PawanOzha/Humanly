import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, T } from "@/components/legal/doc";
import { LINKS } from "@/lib/links";

export const metadata = docMeta("/about", "About", "Humanora is an AI humanizer and AI text detector that shows its work: it scores each sentence, explains what reads as machine-written, and rewrites it in your chosen tone.");

export default function About() {
  return (
    <Doc kicker="Company" title="About Humanora" updated={false} intro={<p>Humanora helps people who write with AI make the result sound like them. Instead of a single opaque score, it shows its work sentence by sentence.</p>}>
      <h2>What it does</h2>
      <ul>
        <li><strong>Detects</strong>: scores each sentence for AI-like writing patterns and highlights the ones that stand out.</li>
        <li><strong>Rewrites</strong>: rewrites a whole draft or a single sentence in a Balanced, Academic or Casual tone.</li>
        <li><strong>Works where you do</strong>: in the browser, with PDF and document upload, or through a REST API (<a href={LINKS.docs}>API docs</a>).</li>
      </ul>

      <h2>What we believe</h2>
      <ul>
        <li>Detection scores are estimates. We show the reasons, not just a number, so you can judge for yourself.</li>
        <li>Your writing belongs to you. You can delete it at any time.</li>
        <li>Be honest with your readers, schools and employers about how you use AI. See our <Link href="/terms#acceptable-use">acceptable use rules</Link>.</li>
      </ul>

      <h2>Who we are</h2>
      <p>Humanora is built and operated by <T v={C.legalName} />, based in <T v={C.address} />. <T v="[TODO: one or two sentences about the founder/team and why Humanora exists]" /></p>

      <p><Link href="/contact">Contact us</Link> · <Link href="/security">Security & Trust</Link></p>
    </Doc>
  );
}
