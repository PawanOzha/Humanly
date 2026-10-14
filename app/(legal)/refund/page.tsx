import Link from "next/link";
import { COMPANY as C } from "@/lib/company";
import { Doc, docMeta, Mail, T } from "@/components/legal/doc";

export const metadata = docMeta("/refund", "Refund Policy", "How cancellations and refunds work for Humanora's paid plans, which are sold through Paddle.");

export default function Refund() {
  return (
    <Doc kicker="Legal" title="Refund Policy" intro={<p>Humanora has a free plan so you can try it before paying. If a paid plan isn&rsquo;t right for you, here is how cancellations and refunds work.</p>}>
      <h2>Cancelling</h2>
      <p>Cancel at any time in the app under Billing. Your plan stays active until the end of the period you paid for, and you won&rsquo;t be charged again.</p>

      <h2>Refunds</h2>
      <ul>
        <li>You can request a full refund within <T v={C.refundWindow} /> of purchase. The request must reach us (or Paddle) within <T v={C.refundWindow} /> of the time on your Paddle receipt.</li>
        <li>After <T v={C.refundWindow} />, payments are not refundable, except as below. Cancelling stops future renewals, and you keep your plan until the end of the period you paid for.</li>
        <li>If you were charged by mistake, for example after cancelling or twice for the same period, we will refund the charge.</li>
        <li>Where consumer law in your country gives you a right to withdraw or a refund, that right applies in addition to this policy.</li>
      </ul>

      <h2>How to ask</h2>
      <p>Within <T v={C.refundWindow} /> of purchase, email <Mail v={C.supportEmail} /> from your account&rsquo;s email address with the date of the charge or your Paddle order number, or contact Paddle directly through the link in your receipt. Our payments are processed by Paddle, our merchant of record, so refunds are issued by Paddle to your original payment method. They usually appear within 5 to 10 business days, depending on your bank.</p>

      <p>See also the <Link href="/terms">Terms of Service</Link>.</p>
    </Doc>
  );
}
