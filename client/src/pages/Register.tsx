import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Primary fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'DONOR' | 'NGO' | 'VOLUNTEER'>('DONOR');

  // Conditional profile fields
  const [orgName, setOrgName] = useState('');
  const [donorType, setDonorType] = useState('HOTEL');
  
  const [capacity, setCapacity] = useState('100');
  const [regNumber, setRegNumber] = useState('');
  
  const [vehicleType, setVehicleType] = useState('TWO_WHEELER');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Read role from query param if available
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'DONOR' || roleParam === 'NGO' || roleParam === 'VOLUNTEER') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (!phone.startsWith('+91') && phone.length === 10) {
      // Auto formatting for Indian numbers
      setPhone(`+91${phone}`);
    }

    const profileData: any = {};
    if (role === 'DONOR') {
      profileData.orgName = orgName || name;
      profileData.donorType = donorType;
    } else if (role === 'NGO') {
      profileData.capacity = Number(capacity);
      profileData.regNumber = regNumber;
    } else if (role === 'VOLUNTEER') {
      profileData.vehicleType = vehicleType;
    }

    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        phone,
        address,
        role,
        profileData
      });

      switch (user.role) {
        case 'DONOR': navigate('/donor-dashboard'); break;
        case 'NGO': navigate('/ngo-dashboard'); break;
        case 'VOLUNTEER': navigate('/volunteer-dashboard'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        
        <div className="text-center mb-6">
          <span className="text-3xl">🤝</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-3 font-sans">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Register to join the surplus food rescue bridge</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role selector tiles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">I want to participate as a:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${role === 'DONOR' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                🏢 Donor
              </button>
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${role === 'NGO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                🏠 NGO
              </button>
              <button
                type="button"
                onClick={() => setRole('VOLUNTEER')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${role === 'VOLUNTEER' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                🛵 Volunteer
              </button>
            </div>
          </div>

          {/* Primary Form Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="e.g. Gopal Krishnan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+919988776655"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Mylapore, Chennai"
              />
            </div>
          </div>

          {/* Conditional Fields based on Role */}
          {role === 'DONOR' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Donor Information</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Organization / Hotel Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  placeholder="e.g. Taj Coromandel"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Donor Category Type</label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="MARRIAGE_HALL">Marriage Hall</option>
                  <option value="RESORT">Resort</option>
                  <option value="CATERER">Caterer</option>
                  <option value="CORPORATE_OFFICE">Corporate Campus</option>
                  <option value="COMMUNITY_EVENT">Community / Feast</option>
                </select>
              </div>
            </div>
          )}

          {role === 'NGO' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NGO Verification Requirements</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Govt Reg Number</label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. NGO-TN-2024-88"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Daily Capacity (meals)</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    placeholder="e.g. 200"
                  />
                </div>
              </div>
              <p className="text-[9px] text-amber-600 italic">
                * Note: NGO registrations remain in PENDING verification until approved by an administrator in their console.
              </p>
            </div>
          )}

          {role === 'VOLUNTEER' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Logistical Vehicle Choice</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Primary Transport Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="TWO_WHEELER">Two Wheeler (Bike/Scooter)</option>
                  <option value="THREE_WHEELER">Three Wheeler (Auto rickshaw)</option>
                  <option value="CAR">Car / Hatchback</option>
                  <option value="VAN">Cargo Van</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 rounded-lg shadow flex justify-center items-center gap-2 text-xs sm:text-sm"
          >
            {loading ? 'Registering Account...' : 'Submit registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
};
