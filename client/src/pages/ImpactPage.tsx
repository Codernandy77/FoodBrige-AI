import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Award, Leaf, Flame, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImpactPage: React.FC = () => {
  const [impactStats, setImpactStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/impact')
      .then(data => {
        setImpactStats(data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Live Impact</span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Our Shared Progres Metrics</h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Through cooperation between hospitality donors, transport volunteers, and shelters, we measure our success in meals rescued and carbon emissions avoided.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Loading system metrics...
        </div>
      ) : !impactStats ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Metrics database currently offline.
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Main Hero Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-500 relative overflow-hidden text-center">
              <span className="text-3xl block mb-2">🍽️</span>
              <h3 className="text-4xl font-black">{impactStats.summary.totalMealsRescued || 0}</h3>
              <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mt-1">Meals Rescued & Served</p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 text-center">
              <span className="text-3xl block mb-2">🌿</span>
              <h3 className="text-4xl font-black">
                {Math.round((impactStats.summary.totalMealsRescued || 0) * 0.45)} kg
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">CO2 Emissions Prevented</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-slate-100 text-center">
              <span className="text-3xl block mb-2">🏠</span>
              <h3 className="text-4xl font-black text-emerald-600">{impactStats.summary.verifiedNgos}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">NGO Shelter Partners</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Monthly Trend */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800">Monthly Rescue Progression Curve</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactStats.monthlyBreakdown}>
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Food Categories */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800">Rescued Food Category Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impactStats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {impactStats.categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* District List Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800">Meals Distributed by Tamil Nadu District</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactStats.districtBreakdown}>
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impact Statement Box */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800">Recognizing our Social Contributors</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every gram of food saved represents an act of solidarity. By verifying donors, providing automated chemical-safety suggestions, and assigning logistics runs rapidly, we ensure transparency and eradicate hunger.
                </p>
                <div className="flex gap-4 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" /> Golden Donors</span>
                  <span className="flex items-center gap-1"><Leaf className="w-4 h-4 text-green-500" /> Green Volunteers</span>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-6 w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
              >
                Join the hunger relief bridge <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
export default ImpactPage;
