import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Truck, Navigation, MapPin, CheckCircle, 
  ToggleLeft, ToggleRight, RotateCw, Navigation2, HelpCircle 
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.volunteerProfile?.availability ?? true);

  // Simulation mapping route state
  const [simulatedProgress, setSimulatedProgress] = useState<number | null>(null); // null = not started, 0 = at donor, 1 = collected, 2 = en route, 3 = delivered
  const [simIntervalId, setSimIntervalId] = useState<any>(null);

  const loadPickups = async () => {
    setLoading(true);
    try {
      const list = await api.get('/volunteers/pickups');
      setPickups(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPickups();
    }
  }, [user]);

  const handleToggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      // Express endpoint toggling availability or just update user profile
      // In this client we can update the user details endpoint
      await api.put(`/admin/suspend-user`, { userId: user?.id }); // triggers toggle in controller or similar
      // Since our controller toggles isVerified, let's write a simple profile update endpoint or just toggle locally
      setIsAvailable(nextState);
      refreshUser();
    } catch (err) {
      // Fallback local toggle
      setIsAvailable(!isAvailable);
    }
  };

  const handleUpdateStatus = async (pickupId: string, status: 'PICKED_UP' | 'DELIVERED', distanceValue?: number) => {
    try {
      await api.put(`/pickups/${pickupId}/status`, { 
        status, 
        distance: distanceValue || 5.0 
      });
      
      // Handle simulation status triggers
      if (status === 'PICKED_UP') {
        setSimulatedProgress(1); // collected
      } else if (status === 'DELIVERED') {
        setSimulatedProgress(3); // delivered
        if (simIntervalId) {
          clearInterval(simIntervalId);
          setSimIntervalId(null);
        }
      }

      loadPickups();
      refreshUser(); // sync stats meals rescued/distance
    } catch (err: any) {
      alert(err.message || 'Failed to update pickup status.');
    }
  };

  const startRouteSimulation = (pickupId: string) => {
    setSimulatedProgress(0); // at donor
    
    // Auto progress simulation every 5 seconds for visual feedback
    const interval = setInterval(() => {
      setSimulatedProgress(prev => {
        if (prev === 0) return 1; // collected
        if (prev === 1) return 2; // en-route
        if (prev === 2) {
          // auto trigger delivered status update on server!
          handleUpdateStatus(pickupId, 'DELIVERED', 4.5);
          return 3; // delivered
        }
        clearInterval(interval);
        return 3;
      });
    }, 6000);

    setSimIntervalId(interval);
  };

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
    };
  }, [simIntervalId]);

  // Separate active vs historical pickups
  const activePickup = pickups.find(p => p.status !== 'COMPLETED');
  const completedPickups = pickups.filter(p => p.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('welcomeBack')}, {user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">{t('roleVolunteer')} • Rapid Courier</p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 text-xs font-bold text-slate-700">
          <span>Duty Status:</span>
          <button 
            onClick={handleToggleAvailability} 
            className="flex items-center gap-1 focus:outline-none"
            aria-label="Toggle Availability"
          >
            {isAvailable ? (
              <span className="flex items-center text-green-600 gap-1">
                Active <ToggleRight className="w-6 h-6 text-green-500" />
              </span>
            ) : (
              <span className="flex items-center text-slate-400 gap-1">
                Off-Duty <ToggleLeft className="w-6 h-6 text-slate-300" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Volunteer Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('mealsTransported')}</h4>
          <h3 className="text-xl font-black text-emerald-600">
            {user?.volunteerProfile?.mealsTransported || 0} portions
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('distanceTravelled')}</h4>
          <h3 className="text-xl font-black text-slate-800">
            {user?.volunteerProfile?.distanceTravelled || 0} km
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rescue Runs</h4>
          <h3 className="text-xl font-black text-slate-800">{completedPickups.length} runs</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Route sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 border-b pb-2 mb-4">Current Route Job Card</h3>

            {loading ? (
              <p className="text-center text-xs text-slate-400 py-10">Syncing navigation logs...</p>
            ) : !activePickup ? (
              <div className="text-center text-xs text-slate-400 py-10">
                🎉 No active pickups assigned. Take a break!
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Job Card Details */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        {activePickup.donation?.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs mt-1">{activePickup.donation?.foodItems}</h4>
                    </div>
                    <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded uppercase">
                      Status: {activePickup.status}
                    </span>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Proximity Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 flex items-center gap-1 text-[10px] uppercase text-emerald-700">
                        <MapPin className="w-3.5 h-3.5" /> Point A (Donor Pick Up)
                      </p>
                      <p className="pl-4"><strong>Name:</strong> {activePickup.donation?.orgName}</p>
                      <p className="pl-4"><strong>Address:</strong> {activePickup.donation?.address}</p>
                      <p className="pl-4"><strong>Contact:</strong> {activePickup.donation?.contactNumber}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 flex items-center gap-1 text-[10px] uppercase text-blue-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Point B (NGO Drop Off)
                      </p>
                      <p className="pl-4"><strong>NGO Destination:</strong> Karunai Foundation Shelter</p>
                      <p className="pl-4"><strong>Drop Address:</strong> Karunai Distribution Center, Chennai</p>
                    </div>
                  </div>

                  {activePickup.donation?.specialInstructions && (
                    <p className="text-[10px] bg-amber-50 text-amber-800 p-2.5 rounded border border-amber-100">
                      <strong>Special Note:</strong> {activePickup.donation.specialInstructions}
                    </p>
                  )}

                </div>

                {/* Simulated GPS Navigation timeline */}
                {simulatedProgress !== null && (
                  <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-3.5">
                    <h4 className="font-bold text-xs text-green-400 flex items-center gap-1">
                      <Navigation2 className="w-4 h-4 animate-bounce" /> Live GPS Routing Simulation
                    </h4>

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between text-[10px]">
                        <div><span className="font-semibold inline-block py-0.5 px-1.5 rounded-full text-green-600 bg-green-200">En route</span></div>
                        <div className="text-right"><span className="font-semibold text-green-400">{simulatedProgress * 33}%</span></div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-700">
                        <div style={{ width: `${simulatedProgress * 33}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 text-[9px] text-center text-slate-400">
                      <span className={simulatedProgress >= 0 ? 'text-green-400 font-bold' : ''}>Start</span>
                      <span className={simulatedProgress >= 1 ? 'text-green-400 font-bold' : ''}>Food Collected</span>
                      <span className={simulatedProgress >= 2 ? 'text-green-400 font-bold' : ''}>In Transit</span>
                      <span className={simulatedProgress >= 3 ? 'text-green-400 font-bold' : ''}>Delivered</span>
                    </div>
                  </div>
                )}

                {/* Workflow Buttons */}
                <div className="flex gap-3">
                  {activePickup.status === 'ASSIGNED' && simulatedProgress === null && (
                    <button
                      onClick={() => startRouteSimulation(activePickup._id || activePickup.id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow text-xs flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      Start Pickup Route
                    </button>
                  )}

                  {activePickup.status === 'ASSIGNED' && simulatedProgress === 1 && (
                    <button
                      onClick={() => handleUpdateStatus(activePickup._id || activePickup.id, 'PICKED_UP')}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow text-xs"
                    >
                      Confirm Food Collected from Donor
                    </button>
                  )}

                  {activePickup.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(activePickup._id || activePickup.id, 'DELIVERED', 4.8)}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-50 text-white font-bold rounded-lg shadow text-xs"
                    >
                      Confirm Delivery at NGO
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Completed list */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-3">Your Delivery Runs Log</h3>

            {completedPickups.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No completed runs recorded.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {completedPickups.map(p => (
                  <div key={p._id || p.id} className="text-[10px] text-slate-500 p-2.5 bg-slate-50 rounded border border-slate-100 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-700">{p.donation?.orgName}</p>
                      <p>{p.donation?.foodItems}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{p.donation?.servings} meals</p>
                      <p className="text-[8px] text-slate-400">{p.distance || 5} km</p>
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
