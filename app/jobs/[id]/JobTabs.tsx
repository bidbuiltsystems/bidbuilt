"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JobTabs({ job, scopes, files }: { job: any; scopes: any[]; files: any[] }) {
  const [activeTab, setActiveTab] = useState("takeoff");
  const [scopeList, setScopeList] = useState(scopes);
  const [addingScopeName, setAddingScopeName] = useState("");
  const [showAddScope, setShowAddScope] = useState(false);

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
            onClick={() => setActiveTab(tab)}
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
          <p className="text-sm text-gray-400">Pricing tab coming next.</p>
        </div>
      )}

      {activeTab === "files" && (
        <div>
          <p className="text-sm text-gray-400">Files tab coming next.</p>
        </div>
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
