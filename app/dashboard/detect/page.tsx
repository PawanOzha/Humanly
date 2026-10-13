import type { Metadata } from "next";
import { Suspense } from "react";
import { Workspace } from "@/components/dashboard/workspace";

export const metadata: Metadata = {
  title: "AI detection — Humanora",
  description: "Score a draft sentence by sentence.",
};

export default function DetectPage() {
  return (
    <Suspense fallback={null}>
      <Workspace intent="detect" />
    </Suspense>
  );
}
