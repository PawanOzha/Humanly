import type { Metadata } from "next";
import { PdfCheck } from "@/components/dashboard/pdf-check";

export const metadata: Metadata = {
  title: "PDF check — Humanly",
  description: "Check a PDF for AI writing.",
};

export default function PdfPage() {
  return <PdfCheck />;
}
