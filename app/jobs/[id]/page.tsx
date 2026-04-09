import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import JobTabs from "./JobTabs";

export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: job } = await supabase
    .from("jobs")
    .select(`*, job_gcs(gc:general_contractors(name))`)
    .eq("id", id)
    .single();

  if (!job) notFound();

  const { data: scopes } = await supabase
    .from("scopes")
    .select(`*, scope_vendors(*, vendor:vendors(name), line_items(*))`)
    .eq("job_id", id);

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("job_id", id);

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
      <JobTabs job={job} scopes={scopes ?? []} files={files ?? []} />
    </main>
  );
}