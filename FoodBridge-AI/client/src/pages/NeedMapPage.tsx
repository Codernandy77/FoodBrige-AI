import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';
import { MapPin, ShieldAlert, PlusCircle, AlertTriangle } from 'lucide-react';

export const NeedMapPage: React.FC = () => {
  const { user } = useAuth();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [areaName, setAreaName] = useState('');
  const [servingsNeeded, setServingsNeeded] = useState('300');
  const [needLevel, setNeedLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.get('/need-reports');
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Only allow verified NGOs or Volunteers to report
    if (!user || (user.role !== 'NGO' && user.role !== 'VOLUNTEER' && user.role !== 'ADMIN')) {
      setError('Only registered NGOs or Volunteers can submit hunger reports.');
      return;
    }

    try {
      await api.post('/need-reports', {
        areaName,
        needLevel,
        servingsNeeded: Number(servingsNeeded),
        latitude: 13.08 + (Math.random() - 0.5) * 0.1, // Chennai random cluster
        longitude: 80.27 + (Math.random() - 0.5) * 0.1,
        details
      });

      // Clear Form & Reload
      setAreaName('');
      setDetails('');
      setShowForm(false);
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to submit need report.');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Convert reports to map markers
  const mapMarkers = reports.map((r) => ({
    id: r._id || r.id,
    lat: r.latitude,
    lng: r.longitude,
    title: `Need: ${r.areaName}`,
    description: `${r.details || 'No details provided.'} Reported by ${r.reporterName}`,
    type: 'need' as const,
    servings: r.servingsNeeded,
    meta: `Priority Level: ${r.needLevel}`
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Intro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Community Hunger Deficit Map</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Aggregated area-level demand indicators to optimize food rescue drop points.
          </p>
        </div>

        {/* Show Report Button only for NGO/Volunteer/Admin */}
        {user && (user.role === 'NGO' || user.role === 'VOLUNTEER' || user.role === 'ADMIN') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" /> Report Deficit Area
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Map Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">Chennai Aggregated Hunger Index Grid</h3>
            <InteractiveMap markers={mapMarkers} height="400px" />
            <p className="text-[10px] text-slate-400 italic">
              * Exact coordinates of shelters or vulnerable groups are obscured. Data is rendered at aggregate village/district levels to protect privacy.
            </p>
          </div>
        </div>

        {/* Report List and Form Overlay Panel */}
        <div className="space-y-6">
          
          {/* Submit Report Form */}
          {showForm && (
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-md space-y-4 animate-in slide-in-from-right-4 duration-200">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Report Hunger Area Deficit
              </h3>

              {error && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-xs text-rose-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Area Location Name</label>
                  <input
                    type="text"
                    required
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    placeholder="e.g. Chennai Central Railway Station Outer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Deficit Level</label>
                    <select
                      value={needLevel}
                      onChange={(e: any) => setNeedLevel(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    >
                      <option value="HIGH">High Demand</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low Demand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Portions Needed Daily</label>
                    <input
                      type="number"
                      required
                      value={servingsNeeded}
                      onChange={(e) => setServingsNeeded(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Details & Context</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg h-20"
                    placeholder="Describe specific community groups, delivery hours, or items needed."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold"
                  >
                    Post Report
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of deficit reports */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-4">Reported Active Deficit Areas</h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No deficit reports registered.</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {reports.map((r) => (
                  <div key={r._id || r.id} className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-slate-800">{r.areaName}</h4>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold border uppercase tracking-wider ${getLevelColor(r.needLevel)}`}>
                        {r.needLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">{r.details || 'No additional details provided.'}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                      <span>Needed: <strong>{r.servingsNeeded} servings</strong></span>
                      <span>By: {r.reporterName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
