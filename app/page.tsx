import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, created_by:users!jobs_created_by_fkey(name)")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">BidBuilt</h1>
        <a href="/jobs/new" className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">
          + New bid
        </a>
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
        Recent jobs
      </p>
      <div className="flex flex-col gap-2">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <a key={job.id} href={`/jobs/${job.id}`} className="border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-sm">{job.job_name}</p>
              <p className="text-xs text-gray-400 mt-1">
                Quote #{job.quote_number} · {job.quote_date} · {(job.created_by as any)?.name ?? "Unknown"}
              </p>
            </a>
          ))
        ) : (
          <p className="text-sm text-gray-400">No bids yet. Create your first one.</p>
        )}
      </div>
    </main>
  );
}