"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewJob() {
  const router = useRouter();
  const [jobName, setJobName] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [gcName, setGcName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getNextQuoteNumber() {
      const { data } = await supabase
        .from("jobs")
        .select("quote_number")
        .order("quote_number", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const last = parseInt(data[0].quote_number, 10);
        setQuoteNumber(String(last + 1));
      } else {
        setQuoteNumber("208700");
      }
    }
    getNextQuoteNumber();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({ job_name: jobName, quote_number: quoteNumber, quote_date: quoteDate })
      .select()
      .single();

    if (jobError) {
      setError(jobError.message);
      setLoading(false);
      return;
    }

    if (gcName) {
      const { data: gc } = await supabase
        .from("general_contractors")
        .insert({ name: gcName })
        .select()
        .single();

      if (gc) {
        await supabase.from("job_gcs").insert({ job_id: job.id, gc_id: gc.id });
      }
    }

   window.location.href = `/jobs/${job.id}`;
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-sm text-gray-400 hover:text-black">← Back</a>
        <h1 className="text-xl font-medium">New bid</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Job name</label>
          <input
            type="text"
            required
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="The Walk-In Taproom TI"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Quote number</label>
          <div className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-400">
            {quoteNumber || "Loading..."}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">Quote date</label>
          <input
            type="date"
            required
            value={quoteDate}
            onChange={(e) => setQuoteDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">General contractor</label>
          <input
            type="text"
            value={gcName}
            onChange={(e) => setGcName(e.target.value)}
            placeholder="Layton Construction"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !quoteNumber}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create bid"}
        </button>
      </form>
    </main>
  );
}