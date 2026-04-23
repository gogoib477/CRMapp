"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Mail, Building, Clock, Sparkles, Search, Plus } from "lucide-react";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  vision: string;
  status: string;
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Prospector State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", id);
    if (!error) setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
  };

  const searchProspects = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    const res = await fetch('/api/find-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery })
    });
    const data = await res.json();
    setProspects(data.results || []);
    setSearching(false);
  };

  const addProspectToCRM = async (prospect: any) => {
    const { error } = await supabase.from("leads").insert([prospect]);
    if (!error) {
      alert("Added to CRM!");
      fetchLeads(); // Refresh the board
      setProspects(prospects.filter(p => p.email !== prospect.email)); // Remove from prospect list
    }
  };

  const getLeadsByStatus = (status: string) => leads.filter(lead => lead.status === status);

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold text-xl flex justify-center items-center min-h-screen">Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lead Management</h1>
          <p className="text-slate-500">Foodsure Innovation Portal</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          Total Leads: <span className="bg-white px-2 py-1 rounded-md text-emerald-900">{leads.length}</span>
        </div>
      </header>

      {/* NEW: Outbound Prospector Section */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Search size={20} className="text-emerald-400"/> Outbound Prospector</h2>
        <form onSubmit={searchProspects} className="flex gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Search for local food businesses to pitch (e.g., 'Kombucha Brands')" 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button disabled={searching} type="submit" className="bg-emerald-600 hover:bg-emerald-500 font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
            {searching ? "Scanning..." : "Find Leads"}
          </button>
        </form>

        {/* Prospect Results */}
        {prospects.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mt-6 border-t border-slate-700 pt-6">
            {prospects.map((p, idx) => (
              <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-emerald-400">{p.company}</h3>
                <p className="text-sm text-slate-400 mb-4">{p.email}</p>
                <button onClick={() => addProspectToCRM(p)} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition-colors">
                  <Plus size={16} /> Add to Kanban Board
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid md:grid-cols-3 gap-6 align-top">
        <Column title="New Inquiries" leads={getLeadsByStatus("New Inquiry")} updateStatus={updateStatus} color="bg-blue-50 border-blue-200" headerColor="bg-blue-600" />
        <Column title="Contacted" leads={getLeadsByStatus("Contacted")} updateStatus={updateStatus} color="bg-amber-50 border-amber-200" headerColor="bg-amber-500" />
        <Column title="Closed / Won" leads={getLeadsByStatus("Closed")} updateStatus={updateStatus} color="bg-emerald-50 border-emerald-200" headerColor="bg-emerald-600" />
      </div>
    </div>
  );
}

function Column({ title, leads, updateStatus, color, headerColor }: { title: string, leads: Lead[], updateStatus: Function, color: string, headerColor: string }) {
  const [drafts, setDrafts] = useState<{[key: string]: string}>({});
  const [generating, setGenerating] = useState<{[key: string]: boolean}>({});

  const generateAIEmail = async (lead: Lead) => {
    setGenerating({ ...generating, [lead.id]: true });
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      const data = await res.json();
      setDrafts({ ...drafts, [lead.id]: data.draft });
    } catch (error) {
      alert("Failed to connect to AI");
    }
    setGenerating({ ...generating, [lead.id]: false });
  };

  return (
    <div className={`rounded-2xl border p-4 min-h-[600px] shadow-sm ${color}`}>
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-200/50">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${headerColor}`}></div>{title} 
        </h2>
        <span className="bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm text-slate-600">{leads.length}</span>
      </div>
      
      <div className="space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 text-lg">{lead.name}</h3>
              <select className="text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 cursor-pointer hover:bg-slate-100 outline-none" value={lead.status || "New Inquiry"} onChange={(e) => updateStatus(lead.id, e.target.value)}>
                <option value="New Inquiry">New Inquiry</option>
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {lead.company && <div className="flex items-center gap-2"><Building size={14} className="text-slate-400"/> {lead.company}</div>}
              <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {lead.email}</div>
              <div className="flex items-center gap-2 font-medium text-emerald-700"><Clock size={14}/> {lead.stage}</div>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-lg text-sm text-indigo-900 italic border border-indigo-100 relative mb-4">
              <span className="absolute -top-2 -left-2 text-2xl text-indigo-200">"</span>
              {lead.vision}
            </div>

            {/* AI Magic Button Area */}
            {drafts[lead.id] ? (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900">
                <p className="font-bold mb-2 flex items-center gap-1"><Sparkles size={14}/> AI Draft:</p>
                <p className="whitespace-pre-wrap">{drafts[lead.id]}</p>
                <a href={`mailto:${lead.email}?subject=Foodsure Innovation Consultation&body=${encodeURIComponent(drafts[lead.id])}`} className="mt-3 block text-center bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Open in Email App
                </a>
              </div>
            ) : (
              <button onClick={() => generateAIEmail(lead)} disabled={generating[lead.id]} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm transition-colors">
                <Sparkles size={16} /> {generating[lead.id] ? "Writing Email..." : "Generate AI Pitch"}
              </button>
            )}
          </div>
        ))}
        {leads.length === 0 && <div className="text-center text-slate-400 text-sm py-10 bg-white/50 rounded-xl border border-dashed border-slate-300">No leads in this stage.</div>}
      </div>
    </div>
  );
}