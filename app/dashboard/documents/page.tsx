import type { Metadata } from "next";
import { Documents } from "@/components/dashboard/documents";

export const metadata: Metadata = {
  title: "Documents — Humanora",
  description: "Your saved checks and rewrites.",
};

export default function DocumentsPage() {
  return <Documents />;
}
