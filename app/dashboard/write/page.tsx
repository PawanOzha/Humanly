import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/dashboard/workspace";

export const metadata: Metadata = {
  title: "Humanize — Humanora",
  description: "Score a draft and rewrite it in your tone.",
};

export default function WritePage() {
  return (
    <Suspense fallback={null}>
      <Workspace />
    </Suspense>
  );
}
