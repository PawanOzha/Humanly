import { LandingPage } from "@/components/landing-page";
import { JsonLd } from "@/components/seo/json-ld";

export default function Home() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
