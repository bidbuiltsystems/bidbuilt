"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JobTabs({ job, scopes, files }: { job: any; scopes: any[]; files: any[] }) {
  const [activeTab, setActiveTab] = useState("takeoff");
  const [scopeList, setScopeList] = useState(scopes);
  const [addingScopeName, setAddingScopeName] = useState("");
  const [showAddScope, setShowAddScope] = useState(false);

  async function reloadScopes() {
  const { data } = await supabase
    .from("scopes")
    .select(`*, scope_vendors(*, vendor:vendors(name), line_items(*))`)
    .eq("job_id", job.id);
  if (data) setScopeList(data);
}

  async function handleAddScope() {
    if (!addingScopeName.trim()) return;
    const { data } = await supabase
      .from("scopes")
      .insert({ job_id: job.id, scope_name: addingScopeName })
      .select()
      .single();
    if (data) {
      setScopeList([...scopeList, { ...data, scope_vendors: [] }]);
      setAddingScopeName("");
      setShowAddScope(false);
    }
  }

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        {["takeoff", "pricing", "files", "proposal"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); reloadScopes(); }}
            className={`px-4 py-2 text-sm capitalize ${activeTab === tab ? "font-medium border-b-2 border-black" : "text-gray-400"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "takeoff" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Scopes</p>
            <button onClick={() => setShowAddScope(true)} className="text-sm text-blue-500 hover:text-blue-700">+ Add scope</button>
          </div>

          {showAddScope && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={addingScopeName}
                onChange={(e) => setAddingScopeName(e.target.value)}
                placeholder="e.g. Washroom accessories — Bobrick"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
              <button onClick={handleAddScope} className="bg-black text-white text-sm px-4 py-2 rounded-lg">Add</button>
              <button onClick={() => setShowAddScope(false)} className="text-sm text-gray-400 px-2">Cancel</button>
            </div>
          )}

          {scopeList.length === 0 ? (
            <p className="text-sm text-gray-400">No scopes yet. Add your first scope.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {scopeList.map((scope) => (
                <div key={scope.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm">{scope.scope_name}</p>
                  </div>
                  <ScopeLineItems scope={scope} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

     {activeTab === "pricing" && (
  <div>
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Pricing</p>
    </div>
    {scopeList.length === 0 ? (
      <p className="text-sm text-gray-400">No scopes yet. Add scopes in the Takeoff tab first.</p>
    ) : (
      <div className="flex flex-col gap-6">
        {scopeList.map((scope) => (
          <PricingScope key={scope.id} scope={scope} />
        ))}
      </div>
    )}
  </div>
)}

     {activeTab === "files" && (
  <FilesTab jobId={job.id} initialFiles={files} />
)}

      {activeTab === "proposal" && (
        <div>
          <p className="text-sm text-gray-400">Proposal tab coming next.</p>
        </div>
      )}
    </div>
  );
}

function ScopeLineItems({ scope }: { scope: any }) {
  const [items, setItems] = useState(scope.scope_vendors?.[0]?.line_items ?? []);
  const [showAdd, setShowAdd] = useState(false);
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [quantity, setQuantity] = useState("1");

  async function handleAddItem() {
    if (!partNumber.trim()) return;

    let scopeVendorId = scope.scope_vendors?.[0]?.id;

    if (!scopeVendorId) {
      const { data: sv } = await supabase
        .from("scope_vendors")
        .insert({ scope_id: scope.id })
        .select()
        .single();
      scopeVendorId = sv?.id;
    }

    const { data } = await supabase
      .from("line_items")
      .insert({
        scope_vendor_id: scopeVendorId,
        part_number: partNumber,
        description: description,
        quantity: parseInt(quantity),
      })
      .select()
      .single();

    if (data) {
      setItems([...items, data]);
      setPartNumber("");
      setDescription("");
      setArea("");
      setQuantity("1");
      setShowAdd(false);
    }
  }

  return (
    <div>
      {items.length > 0 && (
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left py-1 pr-4">Part #</th>
              <th className="text-left py-1 pr-4">Description</th>
              <th className="text-left py-1 pr-4">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-1 pr-4 text-gray-600">{item.part_number}</td>
                <td className="py-1 pr-4 text-gray-600">{item.description}</td>
                <td className="py-1 pr-4 text-gray-600">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd ? (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-2">
            <input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} placeholder="Part #" className="border border-gray-200 rounded px-3 py-1 text-xs w-28 focus:outline-none" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border border-gray-200 rounded px-3 py-1 text-xs flex-1 focus:outline-none" />
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" type="number" className="border border-gray-200 rounded px-3 py-1 text-xs w-16 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddItem} className="bg-black text-white text-xs px-3 py-1 rounded">Add item</button>
            <button onClick={() => setShowAdd(false)} className="text-xs text-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="text-xs text-blue-500 hover:text-blue-700">+ Add line item</button>
      )}
    </div>
  );
}

function PricingScope({ scope }: { scope: any }) {
  const [items, setItems] = useState(scope.scope_vendors?.[0]?.line_items ?? []);
  const scopeVendorId = scope.scope_vendors?.[0]?.id;

  async function handlePriceChange(itemId: string, field: string, value: string) {
    const numVal = parseFloat(value) || 0;
    await supabase.from("line_items").update({ [field]: numVal }).eq("id", itemId);
    setItems((prev: any[]) =>
      prev.map((item: any) => (item.id === itemId ? { ...item, [field]: numVal } : item))
    );
  }

  function calcExtended(item: any) {
    const base = (item.unit_price || 0) * (item.quantity || 1);
    const withFreight = base + (item.freight || 0);
    const withMultiplier = withFreight * (item.multiplier || 1);
    const withMarkup = withMultiplier * (1 + (item.markup_pct || 0) / 100);
    return withMarkup.toFixed(2);
  }

  const scopeTotal = items.reduce((sum: number, item: any) => sum + parseFloat(calcExtended(item)), 0);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="font-medium text-sm mb-3">{scope.scope_name}</p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">No line items. Add them in the Takeoff tab first.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left py-1 pr-3">Part #</th>
                  <th className="text-left py-1 pr-3">Desc</th>
                  <th className="text-left py-1 pr-3">Qty</th>
                  <th className="text-left py-1 pr-3">Unit price</th>
                  <th className="text-left py-1 pr-3">Freight</th>
                  <th className="text-left py-1 pr-3">Multiplier</th>
                  <th className="text-left py-1 pr-3">Markup %</th>
                  <th className="text-left py-1">Extended</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 text-gray-600">{item.part_number}</td>
                    <td className="py-2 pr-3 text-gray-600">{item.description}</td>
                    <td className="py-2 pr-3 text-gray-600">{item.quantity}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        defaultValue={item.unit_price || ""}
                        onBlur={(e) => handlePriceChange(item.id, "unit_price", e.target.value)}
                        placeholder="0.00"
                        className="border border-gray-200 rounded px-2 py-1 w-20 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        defaultValue={item.freight || ""}
                        onBlur={(e) => handlePriceChange(item.id, "freight", e.target.value)}
                        placeholder="0.00"
                        className="border border-gray-200 rounded px-2 py-1 w-20 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        defaultValue={item.multiplier || 1}
                        onBlur={(e) => handlePriceChange(item.id, "multiplier", e.target.value)}
                        placeholder="1.0"
                        className="border border-gray-200 rounded px-2 py-1 w-16 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        defaultValue={item.markup_pct || ""}
                        onBlur={(e) => handlePriceChange(item.id, "markup_pct", e.target.value)}
                        placeholder="0"
                        className="border border-gray-200 rounded px-2 py-1 w-16 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 font-medium">${calcExtended(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3 gap-4 text-sm">
            <span className="text-gray-400">Scope subtotal</span>
            <span className="font-medium">${scopeTotal.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function FilesTab({ jobId, initialFiles }: { jobId: string; initialFiles: any[] }) {
  const [fileList, setFileList] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const filePath = `${jobId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("job-files")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = await supabase
      .from("files")
      .insert({
        job_id: jobId,
        file_name: file.name,
        file_type: file.type,
        storage_url: filePath,
      })
      .select()
      .single();

    if (data) setFileList([...fileList, data]);
    setUploading(false);
    e.target.value = "";
  }

  async function handleDownload(file: any) {
    const { data } = await supabase.storage
      .from("job-files")
      .createSignedUrl(file.storage_url, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Files</p>
        <label className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">
          {uploading ? "Uploading..." : "+ Upload file"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {fileList.length === 0 ? (
        <p className="text-sm text-gray-400">No files yet. Upload vendor quotes, plans, or specs.</p>
      ) : (
        <div className="flex flex-col">
          {fileList.map((file) => (
            <div key={file.id} className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm">{file.file_name}</span>
              <button
                onClick={() => handleDownload(file)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}