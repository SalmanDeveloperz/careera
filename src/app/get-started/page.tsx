import { Header } from "@/components/Header";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Get Started — Careera",
  description: "Set up your profile for personalized career guidance and roadmaps.",
};

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Build your career profile
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Whether you&apos;re at UAF Burewala, another agriculture campus, or anywhere in the
            world — we&apos;ll tailor roadmaps and opportunities to you.
          </p>
        </div>
        <OnboardingWizard />
      </main>
    </div>
  );
}
