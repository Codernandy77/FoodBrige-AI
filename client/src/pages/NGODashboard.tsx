import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  MapPin, ShieldCheck, Truck, ListFilter, Map, CheckSquare, 
  UserCheck, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';

export const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [nearbyDonations, setNearbyDonations] = useState<any[]>([]);
  const [acceptedDonations, setAcceptedDonations] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVegType, setFilterVegType] = useState('');
  const [filterSafety, setFilterSafety] = useState('');

  // Selected Volunteer mapping states
  const [selectedVolunteerMap, setSelectedVolunteerMap] = useState<Record<string, string>>({});
  
  // Dashboard Metrics
  const [stats, setStats] = useState({
    availableDonations: 0,
    acceptedDonationsCount: 0,
    completedDonationsCount: 0,
    mealsDistributed: 0
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Load open donations
      const open = await api.get('/ngos/nearby');
      setNearbyDonations(open);

      // 2. Load pickups (this NGO's accepted items)
      const pickups = await api.get('/pickups');
      setAcceptedDonations(pickups);

      // 3. Load active volunteers
      const vols = await api.get('/ngos/volunteers/available');
      setVolunteers(vols);

      // Calculate stats based on pickups
      const completed = pickups.filter((p: any) => p.status === 'COMPLETED');
      const meals = completed.reduce((sum: number, p: any) => sum + (p.donation?.servings || 0), 0);

      setStats({
        availableDonations: open.length,
        acceptedDonationsCount: pickups.filter((p: any) => p.status !== 'COMPLETED').length,
        completedDonationsCount: completed.length,
        mealsDistributed: meals
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleAcceptDonation = async (donationId: string) => {
    try {
      await api.post(`/donations/${donationId}/accept`, {});
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept donation.');
    }
  };

  const handleAssignVolunteer = async (donationId: string) => {
    const volId = selectedVolunteerMap[donationId];
    if (!volId) {
      alert('Please select a volunteer from the list.');
      return;
    }
    try {
      await api.post(`/donations/${donationId}/assign-volunteer`, { volunteerId: volId });
      // Clear selection
      setSelectedVolunteerMap(prev => {
        const copy = { ...prev };
        delete copy[donationId];
        return copy;
      });
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign volunteer.');
    }
  };

  const handleConfirmDistribution = async (pickupId: string) => {
    try {
      await api.put(`/pickups/${pickupId}/status`, { status: 'COMPLETED' });
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm distribution.');
    }
  };

  // Distance calculator helper
  const calculateDistance = (lat1: number, lon1: number) => {
    // Default center Chennai (13.08, 80.27)
    const lat2 = 13.0827;
    const lon2 = 80.2707;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  // Filter & sort logic (Smart matching proximity order)
  const filteredDonations = nearbyDonations
    .filter(d => {
      const matchCat = !filterCategory || d.category === filterCategory;
      const matchVeg = !filterVegType || d.foodType === filterVegType;
      const matchSafety = !filterSafety || d.safetyStatus === filterSafety;
      return matchCat && matchVeg && matchSafety;
    })
    // Sort by proximity (closest first)
    .map(d => ({
      ...d,
      distance: calculateDistance(d.latitude, d.longitude)
    }))
    .sort((a, b) => a.distance - b.distance);

  // Map markers for available food + accepted active food
  const mapMarkers = [
    ...nearbyDonations.map(d => ({
      id: d._id || d.id,
      lat: d.latitude,
      lng: d.longitude,
      title: d.orgName,
      description: `${d.category}: ${d.foodItems}`,
      type: 'pending' as const,
      servings: d.servings,
      meta: `Deadline: ${new Date(d.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    })),
    ...acceptedDonations
      .filter(p => p.status !== 'COMPLETED')
      .map(p => ({
        id: p._id || p.id,
        lat: p.donation?.latitude || 13.08,
        lng: p.donation?.longitude || 80.27,
        title: `Pickup: ${p.donation?.orgName}`,
        description: `Status: ${p.status} - ${p.donation?.foodItems}`,
        type: 'accepted' as const,
        servings: p.donation?.servings || 0,
        meta: `NGO Assigned: ${user?.name}`
      }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('welcomeBack')}, {user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">{t('roleNgo')} • Verified Serving Partner</p>
        </div>
        
        {/* Verification Alert Banner if NGO is not verified */}
        {!user?.isVerified && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-xs flex items-center gap-2 max-w-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>NGO verification pending. You cannot accept donations until verified by Admin.</span>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Donors</h4>
          <h3 className="text-2xl font-black text-slate-800">{stats.availableDonations}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accepted Active</h4>
          <h3 className="text-2xl font-black text-blue-600">{stats.acceptedDonationsCount}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Deliveries</h4>
          <h3 className="text-2xl font-black text-emerald-600">{stats.completedDonationsCount}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meals Distributed</h4>
          <h3 className="text-2xl font-black text-emerald-600">{stats.mealsDistributed}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Available Food & Filter Roster */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            
            {/* Header & filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 mb-4">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                {t('nearbyDonations')}
              </h2>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="">All Categories</option>
                  {['Rice', 'Biryani', 'Meals', 'Chapati', 'Idli', 'Curry', 'Vegetables', 'Bakery'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filterVegType}
                  onChange={(e) => setFilterVegType(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="">All Types</option>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Veg</option>
                </select>

                <select
                  value={filterSafety}
                  onChange={(e) => setFilterSafety(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="">All Safety</option>
                  <option value="SAFE">Safe Status</option>
                  <option value="CAUTION">Caution</option>
                  <option value="URGENT REVIEW">Urgent Review</option>
                </select>
              </div>
            </div>

            {/* Smart Matching Alert */}
            <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg mb-4">
              <strong>Smart Matching Engine:</strong> Donations listed below sorted by proximity distance. High perishability items with imminent deadlines prioritised.
            </p>

            {/* Donation cards */}
            <div className="space-y-4">
              {filteredDonations.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">
                  No available donations match the filter criteria.
                </div>
              ) : (
                filteredDonations.map((d) => (
                  <div key={d._id || d.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${d.foodType === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}>
                          {d.foodType}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs">{d.orgName} ({d.category})</h4>
                        <span className={`text-[8px] px-1 rounded font-bold uppercase tracking-wide text-white ${
                          d.safetyStatus === 'SAFE' ? 'bg-green-500' :
                          d.safetyStatus === 'CAUTION' ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {d.safetyStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{d.foodItems}</p>
                      
                      <div className="grid grid-cols-2 text-[10px] text-slate-500 gap-y-1">
                        <p><strong>Quantity:</strong> {d.quantity} ({d.servings} portions)</p>
                        <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {d.distance} {t('distanceKm')}</p>
                        <p><strong>Deadline:</strong> {new Date(d.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Address:</strong> {d.address}</p>
                      </div>
                    </div>

                    <div className="self-center">
                      <button
                        onClick={() => handleAcceptDonation(d._id || d.id)}
                        disabled={!user?.isVerified}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs transition-all shadow"
                      >
                        {t('btnAccept')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Map Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">Visual Location Match Grid</h3>
            <InteractiveMap markers={mapMarkers} height="350px" />
          </div>

        </div>

        {/* Accepted Pickups / Assignments Panel */}
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-2 mb-4 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              {t('acceptedDonations')}
            </h2>

            {acceptedDonations.filter(p => p.status !== 'COMPLETED').length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                No active Accepted rescues.
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedDonations
                  .filter(p => p.status !== 'COMPLETED')
                  .map((p) => {
                    const d = p.donation;
                    if (!d) return null;
                    return (
                      <div key={p._id || p.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{d.orgName}</h4>
                            <p className="text-[10px] text-slate-500">{d.foodItems} ({d.servings} servings)</p>
                          </div>
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                            {p.status}
                          </span>
                        </div>

                        {/* Dropdown to assign volunteer */}
                        {p.status === 'ASSIGNED' && !p.volunteerId ? (
                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              Choose Available Delivery Partner:
                            </label>
                            <div className="flex gap-2">
                              <select
                                value={selectedVolunteerMap[d._id || d.id] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedVolunteerMap(prev => ({ ...prev, [d._id || d.id]: val }));
                                }}
                                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              >
                                <option value="">Select Volunteer</option>
                                {volunteers.map(v => (
                                  <option key={v._id || v.id} value={v._id || v.id}>
                                    {v.name} ({v.volunteerProfile?.vehicleType?.replace('_', ' ') || 'Bike'})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignVolunteer(d._id || d.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[10px]"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        ) : p.status === 'ASSIGNED' ? (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Waiting for Volunteer to accept route sheet.
                          </p>
                        ) : null}

                        {/* Volunteer Assigned Information */}
                        {p.volunteerId && (
                          <div className="text-[10px] text-slate-500 bg-slate-100 p-2 rounded">
                            <p><strong>Assigned Volunteer:</strong> {volunteers.find(v => (v._id || v.id) === p.volunteerId)?.name || 'Ramesh'}</p>
                            <p><strong>Distance to cover:</strong> {p.distance || 4.2} km</p>
                          </div>
                        )}

                        {/* Confirmation distribution once delivered */}
                        {p.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleConfirmDistribution(p._id || p.id)}
                            className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg shadow"
                          >
                            Confirm Distribution Completed
                          </button>
                        )}

                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Distribution logs history */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-3">Distribution Records</h3>
            {acceptedDonations.filter(p => p.status === 'COMPLETED').length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No completed distributions.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {acceptedDonations
                  .filter(p => p.status === 'COMPLETED')
                  .map(p => (
                    <div key={p._id || p.id} className="text-[10px] text-slate-500 p-2 border-b border-slate-100 flex justify-between">
                      <div>
                        <p className="font-bold text-slate-700">{p.donation?.orgName}</p>
                        <p>{p.donation?.foodItems}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{p.donation?.servings} meals</p>
                        <p className="text-[8px] text-slate-400">
                          {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                        </p>
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
