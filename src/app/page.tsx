"use client";

import { useState } from "react";
import { supabase } from "../utils/supabase";
import { Beaker, TrendingUp, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    stage: "Just an idea",
    vision: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("leads")
      .insert([formData]);

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setFormData({ name: "", email: "", company: "", stage: "Just an idea", vision: "" });
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <header className="bg-white shadow-sm border-b pb-12 pt-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Where Food Vision <span className="text-emerald-600">Becomes Market Reality.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Foodsure is the partner you can rely on for food and beverage innovation. We go beyond adopting trends; we create them. 
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-medium">
            <CheckCircle size={20} />
            Zero Cost for Initial Concepts
          </div>
        </div>
      </header>

      {/* Main Content & Form */}
      <main className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        
        {/* Left Column - Value Props */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Why choose Foodsure?</h2>
          
          <div className="flex gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg h-fit text-emerald-600">
              <Beaker size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl">Nutritional Engineering</h3>
              <p className="text-slate-600 mt-1">We take care of everything from figuring out new recipes to strict R&D testing and manufacturing.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg h-fit text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl">Market Leadership</h3>
              <p className="text-slate-600 mt-1">Transform your ideas into products that can be scaled. Your brand takes the lead in the market.</p>
            </div>
          </div>
        </div>

        {/* Right Column - The Lead Capture Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold mb-6">Start Your Innovation Journey</h2>
          
          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-lg text-center border border-emerald-200">
              <CheckCircle className="mx-auto mb-2" size={32} />
              <h3 className="font-bold text-lg">Inquiry Received!</h3>
              <p>Our innovation team will reach out shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input required type="text" className="w-full border rounded-lg p-2" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input type="text" className="w-full border rounded-lg p-2" 
                    value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" className="w-full border rounded-lg p-2" 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Stage</label>
                <select className="w-full border rounded-lg p-2 bg-white" 
                  value={formData.stage} onChange={(e) => setFormData({...formData, stage: e.target.value})}>
                  <option>Just an idea</option>
                  <option>Have a recipe</option>
                  <option>Ready for manufacturing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tell us about your vision</label>
                <textarea required rows={4} className="w-full border rounded-lg p-2" 
                  value={formData.vision} onChange={(e) => setFormData({...formData, vision: e.target.value})}></textarea>
              </div>

              <button disabled={loading} type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}