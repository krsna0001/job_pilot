import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing | JobPilot",
  description: "Upgrade to JobPilot Pro to unlock advanced AI job matching and automated applications.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-darkest sm:text-5xl lg:text-6xl">
            Supercharge your job search
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
            Unlock the full potential of JobPilot with our Pro plan. Automate your job applications, get deep company insights, and land your dream job faster.
          </p>
        </div>
        
        <PricingClient />
      </div>
    </main>
  );
}
