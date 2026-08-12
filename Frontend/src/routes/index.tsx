import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/findback/Navbar";
import { Hero } from "@/components/findback/Hero";
import { MatchSection } from "@/components/findback/MatchSection";
import { ItemShowcase } from "@/components/findback/ItemShowcase";
import { HowItWorks } from "@/components/findback/HowItWorks";
import { PotentialMatches } from "@/components/findback/PotentialMatches";
import { VerificationSection } from "@/components/findback/VerificationSection";
import { SafetyFeatures } from "@/components/findback/SafetyFeatures";
import { CTA } from "@/components/findback/CTA";
import { Footer } from "@/components/findback/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FindBack — AI Lost & Found Recovery Network" },
      {
        name: "description",
        content:
          "FindBack reunites lost and found items using AI visual matching, location intelligence and secure ownership verification.",
      },
      { property: "og:title", content: "FindBack — AI Lost & Found Recovery Network" },
      {
        property: "og:description",
        content:
          "AI-powered visual matching, location intelligence and secure ownership verification for lost and found items.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <MatchSection />
        <HowItWorks />
        <ItemShowcase />
        <PotentialMatches />
        <VerificationSection />
        <SafetyFeatures />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
