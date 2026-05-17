import { Header } from "@/components/Header";
import { ChatGuide } from "@/components/guide/ChatGuide";

export const metadata = {
  title: "AI Career Guide — Careera",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">AI Career Guide</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Intelligent guidance powered by your profile and live opportunities — including
            programs open to Pakistani students.
          </p>
        </div>
        <ChatGuide />
      </main>
    </div>
  );
}
