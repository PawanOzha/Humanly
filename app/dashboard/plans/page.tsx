import type { Metadata } from "next";
import { Plans } from "@/components/dashboard/plans";

export const metadata: Metadata = {
  title: "Plan and usage — Humanora",
  description: "Free, Pro, and Team word allowances.",
};

export default function PlansPage() {
  return <Plans />;
}
