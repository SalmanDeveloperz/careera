import Link from "next/link";
import { Header } from "@/components/Header";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";

export const metadata = {
  title: "Your Roadmap — Careera",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Your career roadmap</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Step-by-step guidance with linked opportunities. Progress is saved on this device.
          </p>
        </div>
        <RoadmapViewer />
        <p className="mt-8 text-center text-sm text-zinc-500">
          No profile yet?{" "}
          <Link href="/get-started" className="font-medium text-indigo-600">
            Complete onboarding
          </Link>
        </p>
      </main>
    </div>
  );
}
