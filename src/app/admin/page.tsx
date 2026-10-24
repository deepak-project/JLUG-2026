import type { Metadata } from "next";
import AdminLogin from "@/features/admin/components/AdminLogin";
import SubmissionsDashboard from "@/features/admin/components/SubmissionsDashboard";
import { isAdmin, isAdminConfigured } from "@/features/admin/lib/session";
import { listSubmissions } from "@/features/admin/lib/submissionStore";

export const metadata: Metadata = {
  title: "Admin | JLUG",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdmin();
  return (
    <main className="relative z-10 mx-auto min-h-[calc(100vh-3.5rem)] w-full max-w-[1440px] px-6 py-10 md:px-12">
      {authed ? (
        <SubmissionsDashboard initial={await listSubmissions()} />
      ) : (
        <AdminLogin configured={isAdminConfigured()} />
      )}
    </main>
  );
}
