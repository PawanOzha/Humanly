import type { Metadata } from "next";
import { Overview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Overview — Humanora",
  description: "Your words, documents, and tools in one place.",
};

export default function DashboardPage() {
  return <Overview />;
}
