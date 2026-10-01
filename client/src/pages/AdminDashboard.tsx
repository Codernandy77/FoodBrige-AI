import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ShieldAlert, UserCheck, AlertTriangle, Users, 
  CheckCircle, Ban, ArrowRight, RefreshCw, FileText 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [impactStats, setImpactStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'logs' | 'charts'>('users');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const uList = await api.get('/admin/users');
      setUsers(uList);

      const logsList = await api.get('/admin/logs');
      setLogs(logsList);

      const stats = await api.get('/admin/stats');
      setAdminStats(stats);

      const impact = await api.get('/impact');
      setImpactStats(impact);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  const handleVerifyUser = async (userId: string) => {
    try {
      await api.post('/admin/verify-user', { userId });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify user.');
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    try {
      await api.post('/admin/suspend-user', { userId });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to modify account state.');
    }
  };

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'DONOR': return '🏢';
      case 'NGO': return '🏠';
      case 'VOLUNTEER': return '🛵';
      case 'ADMIN': return '🛡️';
      default: return '👤';
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b', '#ef4444'];

  // Verification lists
  const pendingNgos = users.filter(u => u.role === 'NGO' && !u.isVerified);
  const registeredUsers = users.filter(u => u.role !== 'ADMIN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Console</h1>
          <p className="text-xs text-slate-500 font-semibold">FoodBridge AI Central System Control</p>
        </div>
        <button
          onClick={loadAdminData}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" /> Sync Stats
        </button>
      </div>

      {/* Admin Cards */}
      {adminStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Users</p>
              <h3 className="text-xl font-black text-slate-800">{adminStats.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified NGOs</p>
              <h3 className="text-xl font-black text-blue-600">{adminStats.verifiedNgos}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NGO Reviews</p>
              <h3 className="text-xl font-black text-amber-600">{adminStats.pendingNgos}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meals Rescued</p>
              <h3 className="text-xl font-black text-emerald-600">
                {impactStats?.summary?.totalMealsRescued || 0}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Control */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-2 transition-all border-b-2 ${activeTab === 'users' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-2.5 px-2 transition-all border-b-2 relative ${activeTab === 'verifications' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          NGO Verifications
          {pendingNgos.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] text-white font-bold">
              {pendingNgos.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-2.5 px-2 transition-all border-b-2 ${activeTab === 'charts' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-2 transition-all border-b-2 ${activeTab === 'logs' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Audit System Logs
        </button>
      </div>

      {/* Tables Content */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6">
        
        {loading && (
          <div className="text-center py-20 text-slate-400 text-xs">
            Syncing database records...
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Verified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registeredUsers.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <p>{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <p>{u.phone}</p>
                      <p className="text-[10px] text-slate-400">{u.address}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <span>{getRoleEmoji(u.role)}</span>
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {u.isVerified ? 'Active/Verified' : 'Suspended/Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleSuspend(u._id || u.id)}
                        className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
                          u.isVerified 
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isVerified ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'verifications' && (
          <div>
            {pendingNgos.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No NGO verification requests pending.</p>
            ) : (
              <div className="space-y-4">
                {pendingNgos.map((ngo) => (
                  <div key={ngo._id || ngo.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏠</span>
                        <h4 className="font-extrabold text-slate-800 text-xs">{ngo.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-yellow-100 border border-yellow-200 text-[8px] font-bold text-yellow-800 uppercase tracking-wider">Verification Review</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 text-[10px] text-slate-500 gap-y-1">
                        <p><strong>Email Address:</strong> {ngo.email}</p>
                        <p><strong>Contact Phone:</strong> {ngo.phone}</p>
                        <p><strong>Serving Capacity:</strong> {ngo.ngoProfile?.capacity || 100} daily</p>
                        <p><strong>Registration Number:</strong> {ngo.ngoProfile?.regNumber || 'N/A'}</p>
                      </div>

                      {ngo.ngoProfile?.documentUrl && (
                        <a 
                          href={ngo.ngoProfile.documentUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:underline pt-1"
                        >
                          <FileText className="w-3 h-3" /> View Submitted NGO Document PDF
                        </a>
                      )}
                    </div>

                    <div className="self-center">
                      <button
                        onClick={() => handleVerifyUser(ngo._id || ngo.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow"
                      >
                        Approve NGO Verification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'logs' && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log._id || log.id} className="text-[10px] text-slate-500 p-2.5 hover:bg-slate-50 border-b border-slate-50 flex gap-4">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded flex-shrink-0 self-start">
                  {log.action}
                </span>
                <span className="flex-1 leading-snug">{log.details}</span>
                <span className="text-slate-400 whitespace-nowrap self-end">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Charts Panel */}
        {!loading && activeTab === 'charts' && impactStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Monthly Chart */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700">Meals Rescued by Month</h4>
              <div className="h-64 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactStats.monthlyBreakdown}>
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="meals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700">Surplus Food Category Breakdown</h4>
              <div className="h-64 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impactStats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      outerRadius={65}
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

            {/* Success rates */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700">Rescues Delivery Status Analysis</h4>
              <div className="h-64 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impactStats.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {impactStats.statusBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* District Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700">Meals Distributed by Tamil Nadu District</h4>
              <div className="h-64 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactStats.districtBreakdown} layout="vertical">
                    <XAxis type="number" fontSize={10} />
                    <YAxis dataKey="name" type="category" fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
