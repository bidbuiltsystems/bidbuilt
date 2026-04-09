import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: job } = await supabase
    .from("jobs")
    .select(`*, job_gcs(gc:general_contractors(name))`)
    .eq("id", id)
    .single();
  if (!job) notFound();

  const gcName = job.job_gcs?.[0]?.gc?.name ?? "No GC";

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-2">
        <a href="/" className="text-sm text-gray-400 hover:text-black">← Back</a>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-medium">{job.job_name}</h1>
        <p className="text-sm text-gray-400 mt-1">
          Quote #{job.quote_number} · {gcName} · {job.quote_date}
        </p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <span className="px-4 py-2 text-sm font-medium border-b-2 border-black">Takeoff</span>
        <span className="px-4 py-2 text-sm text-gray-400">Pricing</span>
        <span className="px-4 py-2 text-sm text-gray-400">Files</span>
        <span className="px-4 py-2 text-sm text-gray-400">Proposal</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Scopes</p>
          <button className="text-sm text-blue-500 hover:text-blue-700">+ Add scope</button>
        </div>
        <p className="text-sm text-gray-400">No scopes yet. Add your first scope.</p>
      </div>
    </main>
  );
}