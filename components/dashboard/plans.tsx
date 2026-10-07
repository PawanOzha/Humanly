"use client";

import { useRef, useState } from "react";
import { Mark } from "@/components/dashboard/marks";
import { Meter, Notice, PageIntro } from "@/components/dashboard/ui";
import { useBilling, useBillingView } from "@/lib/stores/billing";
import { formatWords, PLAN_LIST, PLANS, resetLabel, wordsLeft, type PlanId } from "@/lib/workspace";

export function Plans() {
  const billing = useBillingView();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [fault, setFault] = useState("");
  const [done, setDone] = useState<PlanId | null>(null);
  const busy = useRef(false);
  const plan = PLANS[billing.plan];
  const left = wordsLeft(billing);
  const allowance = billing.allowance || plan.monthly;

  const choose = (next: PlanId) => {
    if (busy.current || next === billing.plan) return;
    busy.current = true;
    setFault("");
    setDone(null);
    setPending(next);
    useBilling
      .getState()
      .setPlan(next)
      .then(() => setDone(next))
      .catch((err: unknown) => {
        setFault(err instanceof Error ? err.message : "Couldn't change the plan.");
      })
      .finally(() => {
        busy.current = false;
        setPending(null);
      });
  };

  return (
    <div className="db-page">
      <PageIntro title="Plan and usage" />

      <section className="db-card db-usage-card" aria-label="Usage this month">
        <div className="db-usage-head">
          <div>
            <p className="db-label">Words left</p>
            <p className="db-usage-big">{formatWords(left)}</p>
          </div>
          <dl className="db-usage-facts">
            <div><dt>Used</dt><dd>{formatWords(billing.used)}</dd></div>
            <div><dt>Monthly</dt><dd>{formatWords(allowance)}</dd></div>
            <div><dt>Per run</dt><dd>{formatWords(billing.perRun || plan.perRun)}</dd></div>
            <div><dt>Resets</dt><dd>{resetLabel(billing.period)}</dd></div>
          </dl>
        </div>
        <Meter value={billing.used} max={allowance} label="Words used this month" />
        <p className="db-fine">Checking a draft is free. Only humanizing uses words. The allowance resets on the first of each month, UTC.</p>
      </section>

      <section className="db-plans" aria-label="Plans">
        {PLAN_LIST.map((item, index) => {
          const current = item.id === billing.plan;
          const working = pending === item.id;
          return (
            <article key={item.id} className="db-card db-plan" data-current={current} data-featured={item.id === "pro"} style={{ ["--i" as string]: index }}>
              <div className="db-plan-top">
                <h2>{item.name}</h2>
                {current ? <span className="db-badge">Current plan</span> : item.id === "pro" ? <span className="db-badge db-badge-lime">Most chosen</span> : null}
              </div>
              <p className="db-plan-price">
                <strong>{item.price}</strong>
                <span>{item.period}</span>
              </p>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>
                    <Mark name="check" size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`db-btn ${current ? "db-btn-ghost" : "db-btn-ink"}`}
                data-busy={working}
                disabled={current || pending !== null}
                onClick={() => choose(item.id)}
              >
                <span>{current ? "You're on this plan" : working ? "Switching…" : done === item.id ? "Switched" : `Switch to ${item.name}`}</span>
              </button>
            </article>
          );
        })}
      </section>
      <Notice>{fault}</Notice>
    </div>
  );
}
