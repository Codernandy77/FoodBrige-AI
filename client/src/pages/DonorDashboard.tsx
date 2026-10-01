import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  PlusCircle, History, Award, CheckCircle, ShieldCheck, 
  AlertTriangle, Clock, RefreshCw, Download, FileSpreadsheet, MapPin 
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  // Form inputs
  const [category, setCategory] = useState('Biryani');
  const [foodItems, setFoodItems] = useState('');
  const [foodType, setFoodType] = useState<'VEG' | 'NON_VEG'>('VEG');
  const [quantity, setQuantity] = useState('');
  const [servings, setServings] = useState('50');
  
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getCurrentTimeString = () => new Date().toTimeString().split(' ')[0].substring(0, 5);
  const getFutureTimeString = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

  const [cookingDate, setCookingDate] = useState(getTodayString());
  const [cookingTime, setCookingTime] = useState(getCurrentTimeString());
  const [storageCondition, setStorageCondition] = useState<'AMBIENT' | 'REFRIGERATED' | 'HOT_HOLDING'>('AMBIENT');
  const [isExposed, setIsExposed] = useState(false);
  const [isReheated, setIsReheated] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState(getFutureTimeString(4));
  const [address, setAddress] = useState(user?.address || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Preliminary Safety Live Calculation
  const [safetyAssessment, setSafetyAssessment] = useState<any>({
    safetyStatus: 'SAFE',
    remainingSafeWindowHours: 4,
    warnings: [],
    priorityScore: 50
  });

  // Calculate live safety status when inputs change
  useEffect(() => {
    // Basic client-side calculation matching backend formulas
    const score = calculateClientSafetyAndPriority({
      category,
      cookingDate,
      cookingTime,
      storageCondition,
      isExposed,
      isReheated,
      temperature: temperature ? Number(temperature) : undefined,
      pickupDeadline
    });
    setSafetyAssessment(score);
  }, [category, cookingDate, cookingTime, storageCondition, isExposed, isReheated, temperature, pickupDeadline]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const all = await api.get('/donations');
      // Filter donations belonging to this donor
      const mine = all.filter((d: any) => d.donorId === user?.id);
      setDonations(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Servings
    if (Number(servings) <= 0) {
      setFormError('Estimated servings must be greater than zero.');
      return;
    }

    if (safetyAssessment.safetyStatus === 'DO NOT DISTRIBUTE') {
      setFormError('Cannot post donation: Food has exceeded safety margins.');
      return;
    }

    try {
      await api.post('/donations', {
        category,
        foodItems,
        foodType,
        quantity,
        servings: Number(servings),
        cookingDate,
        cookingTime,
        storageCondition,
        isExposed,
        isReheated,
        temperature: temperature ? Number(temperature) : undefined,
        pickupDeadline,
        address,
        latitude: 13.08 + (Math.random() - 0.5) * 0.05, // Seed nearby Chennai
        longitude: 80.27 + (Math.random() - 0.5) * 0.05,
        contactNumber,
        specialInstructions,
        foodImage: ''
      });

      // Clear Form & Reload
      setFoodItems('');
      setQuantity('');
      setCookingDate(getTodayString());
      setCookingTime(getCurrentTimeString());
      setPickupDeadline(getFutureTimeString(4));
      setShowForm(false);
      loadDonations();
      refreshUser(); // Refresh points/badge
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit food donation.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PICKED_UP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handlePrintCert = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome banner & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('welcomeBack')}, {user?.name}</h1>
          <p className="text-xs text-slate-500 font-semibold">{t('roleDonor')} • {user?.donorProfile?.orgName}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Donor Points</p>
              <h4 className="text-lg font-black text-slate-800">{user?.donorProfile?.points || 0} pts</h4>
            </div>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Badge</p>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest text-emerald-600">
                {user?.donorProfile?.badge || 'Bronze'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active and Past Donations Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              {t('activeDonations')}
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              {t('createNewDonation')}
            </button>
          </div>

          {/* Form Overlay */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-lg animate-in slide-in-from-top-4 duration-200">
              <h3 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Register Food Donation</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-xs text-rose-700 rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Form fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">{t('formCategory')}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      {['Rice', 'Biryani', 'Meals', 'Chapati', 'Idli', 'Dosa', 'Curry', 'Vegetables', 'Fruits', 'Bakery', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Veg / Non-Veg</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFoodType('VEG')}
                        className={`flex-1 py-1.5 text-xs font-bold border rounded-lg transition-colors ${foodType === 'VEG' ? 'bg-green-600 border-green-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Vegetarian
                      </button>
                      <button
                        type="button"
                        onClick={() => setFoodType('NON_VEG')}
                        className={`flex-1 py-1.5 text-xs font-bold border rounded-lg transition-colors ${foodType === 'NON_VEG' ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Non-Veg
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">{t('formFoodItems')}</label>
                    <input
                      type="text"
                      required
                      value={foodItems}
                      onChange={(e) => setFoodItems(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                      placeholder="e.g. Sambar Rice, Potato Fry"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Volume/Qty</label>
                      <input
                        type="text"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                        placeholder="e.g. 5 Containers"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Servings</label>
                      <input
                        type="number"
                        required
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">{t('formCookingDate')}</label>
                    <input
                      type="date"
                      required
                      value={cookingDate}
                      onChange={(e) => setCookingDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">{t('formCookingTime')}</label>
                    <input
                      type="time"
                      required
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Pickup Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={pickupDeadline.slice(0, 16)} // format for datetime-local
                      onChange={(e) => setPickupDeadline(new Date(e.target.value).toISOString())}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Storage Condition</label>
                    <select
                      value={storageCondition}
                      onChange={(e) => setStorageCondition(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="AMBIENT">Ambient Temp</option>
                      <option value="REFRIGERATED">Refrigerated</option>
                      <option value="HOT_HOLDING">Hot Holding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Temp (Optional °C)</label>
                    <input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1.5 pt-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isExposed}
                        onChange={(e) => setIsExposed(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Exposed to open air?
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isReheated}
                        onChange={(e) => setIsReheated(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Previously reheated?
                    </label>
                  </div>
                </div>

                {/* Live Safety Assessment Panel */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-4 items-start">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Safety Assessment (Rule Engine)</span>
                    <div className="flex items-center gap-2 mt-1 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                        safetyAssessment.safetyStatus === 'SAFE' ? 'bg-green-500' :
                        safetyAssessment.safetyStatus === 'CAUTION' ? 'bg-amber-500' :
                        safetyAssessment.safetyStatus === 'URGENT REVIEW' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {safetyAssessment.safetyStatus}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        Remaining Window: {safetyAssessment.remainingSafeWindowHours} hrs
                      </span>
                    </div>

                    {safetyAssessment.warnings.length > 0 ? (
                      <div className="text-[10px] text-rose-600 space-y-0.5">
                        {safetyAssessment.warnings.map((w: string, idx: number) => (
                          <p key={idx} className="flex items-center gap-1">⚠ {w}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-600">✓ Food details represent low initial contamination risks.</p>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Urgency Score</span>
                    <h3 className="text-2xl font-black text-emerald-600">{safetyAssessment.priorityScore}/100</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">{t('formAddress')}</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Donor Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Special Pickup Instructions</label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. Come to kitchen back entrance. Ask for Suresh."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    {t('btnSubmitDonation')}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Active Donations Lists */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-100">
                Loading donation logs...
              </div>
            ) : donations.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-100 text-xs">
                {t('noDonations')}
              </div>
            ) : (
              donations.map((d) => (
                <div key={d._id || d.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase ${d.foodType === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {d.foodType}
                      </span>
                      <span className="font-extrabold text-sm text-slate-800">{d.category} - {d.foodItems}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getStatusBadge(d.status)}`}>
                        {t(`status${d.status.charAt(0).toUpperCase() + d.status.slice(1).toLowerCase()}` as any)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
                      <p><strong>Quantity:</strong> {d.quantity} ({d.servings} servings)</p>
                      <p><strong>Cooked:</strong> {d.cookingTime} on {d.cookingDate}</p>
                      <p><strong>Address:</strong> {d.address}</p>
                      <p><strong>Safety Priority:</strong> {d.priorityScore}/100 ({d.safetyStatus})</p>
                    </div>

                    {d.specialInstructions && (
                      <p className="text-[10px] bg-slate-50 p-2 rounded text-slate-600 border border-slate-100">
                        <strong>Notes:</strong> {d.specialInstructions}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col justify-end items-end gap-2">
                    {d.status === 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedCert(d)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('btnDownloadCert')}
                      </button>
                    )}
                    {d.status === 'PENDING' && (
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to cancel this donation?')) {
                            await api.delete(`/donations/${d._id || d.id}`);
                            loadDonations();
                          }
                        }}
                        className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Impact and Verification Panel */}
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 border-b pb-2 mb-4">Donation Safe Rules</h3>
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Storage Temperature:</strong> Keeping cooked rice or biryani at hot temperatures (&gt;60°C) or refrigeration (&lt;4°C) suppresses bacterial spores.
              </p>
              <p>
                <strong>2. Time Log:</strong> Fresh cooked items left at ambient temperatures must be retrieved within 4-6 hours.
              </p>
              <p className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-[11px] text-amber-800 font-medium">
                Our rule engine automatically excludes spoiled items from volunteer match rosters to avoid food-borne illnesses.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center">
            <span className="text-3xl">🌱</span>
            <h3 className="font-extrabold text-sm text-slate-800 mt-2 mb-1">Environmental Impact</h3>
            <p className="text-xs text-slate-500 mb-3">By diverting surplus food, you reduce landfill methane emissions.</p>
            <div className="bg-emerald-50 py-3 rounded-lg border border-emerald-100 text-center">
              <h4 className="text-lg font-black text-emerald-800">
                {Math.round((user?.donorProfile?.points || 0) * 0.4)} kg
              </h4>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">CO2 Saved Equivalent</p>
            </div>
          </div>

        </div>

      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:relative print:z-0">
          <div className="bg-white max-w-xl w-full border-8 border-double border-amber-500 p-8 rounded-xl shadow-2xl relative text-center print:border-none print:shadow-none print:max-w-none">
            
            {/* Ribbon Stamp */}
            <div className="absolute right-4 top-4 border-2 border-emerald-500 rounded-full w-14 h-14 flex items-center justify-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest -rotate-12 border-dashed print:hidden">
              VERIFIED
            </div>

            <div className="mb-4">
              <span className="text-3xl block">🤝</span>
              <h2 className="text-lg font-black tracking-widest text-slate-700 uppercase mt-2">FoodBridge AI Platform</h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Certificate of Food Rescue</p>
            </div>

            <hr className="border-amber-200 my-4" />

            <div className="my-6 space-y-4">
              <p className="text-xs text-slate-500 italic">This certifies that</p>
              <h3 className="text-xl font-extrabold text-slate-800 font-serif decoration-amber-500 underline underline-offset-4">
                {user?.donorProfile?.orgName}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                has successfully rescued and shared <strong className="text-emerald-700 font-extrabold text-sm">{selectedCert.servings} meals</strong> of <strong>{selectedCert.foodItems}</strong>, safely preventing food wastage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 text-left text-[10px] text-slate-400">
              <div>
                <p><strong>Donation ID:</strong> {selectedCert._id || selectedCert.id}</p>
                <p><strong>Date Rescued:</strong> {selectedCert.cookingDate}</p>
              </div>
              <div className="text-right">
                <p><strong>Verification Hash:</strong> FBAI-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p><strong>Partner NGO:</strong> Karunai Foundation</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-8 print:hidden">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handlePrintCert}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Client-side quick calculation matching server rules
function calculateClientSafetyAndPriority(input: any) {
  const warnings: string[] = [];
  let safetyStatus: 'SAFE' | 'CAUTION' | 'URGENT REVIEW' | 'DO NOT DISTRIBUTE' = 'SAFE';
  let remainingSafeWindowHours = 4;

  const cookDateTime = new Date(`${input.cookingDate}T${input.cookingTime}`);
  const now = new Date();
  
  let elapsedHours = (now.getTime() - cookDateTime.getTime()) / (1000 * 60 * 60);
  if (elapsedHours < 0) elapsedHours = 0;

  const cat = input.category.toLowerCase();
  const isHighPerishability = cat.includes('biryani') || cat.includes('meat') || cat.includes('non-veg') || cat.includes('curry');
  const isLowPerishability = cat.includes('bakery') || cat.includes('fruit') || cat.includes('bread');

  if (input.storageCondition === 'REFRIGERATED') {
    remainingSafeWindowHours = isHighPerishability ? 24 : 36;
  } else if (input.storageCondition === 'HOT_HOLDING') {
    remainingSafeWindowHours = 6;
  } else {
    remainingSafeWindowHours = isHighPerishability ? 4 : isLowPerishability ? 8 : 6;
  }

  if (input.isExposed) {
    remainingSafeWindowHours *= 0.6;
    warnings.push("Food exposed to air.");
  }
  if (input.isReheated) {
    remainingSafeWindowHours *= 0.7;
    warnings.push("Previously reheated.");
  }

  const actualRemainingHours = Math.max(0, remainingSafeWindowHours - elapsedHours);

  if (elapsedHours >= remainingSafeWindowHours) {
    safetyStatus = 'DO NOT DISTRIBUTE';
    warnings.push("Safe storage time elapsed.");
  } else if (actualRemainingHours < 1.0) {
    safetyStatus = 'URGENT REVIEW';
    warnings.push("Urgent pickup needed.");
  } else if (actualRemainingHours < 2.5) {
    safetyStatus = 'CAUTION';
    warnings.push("Monitor condition.");
  } else {
    safetyStatus = 'SAFE';
  }

  let priorityScore = 0;
  if (safetyStatus !== 'DO NOT DISTRIBUTE') {
    const statusWeight = safetyStatus === 'URGENT REVIEW' ? 50 : safetyStatus === 'CAUTION' ? 30 : 15;
    priorityScore = statusWeight + (isHighPerishability ? 15 : 0) + 15;
  }

  return {
    safetyStatus,
    remainingSafeWindowHours: parseFloat(actualRemainingHours.toFixed(1)),
    warnings,
    priorityScore: Math.round(priorityScore)
  };
}
