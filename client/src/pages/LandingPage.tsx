import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Heart, Truck, ShieldCheck, BarChart3, AlertTriangle, 
  ChevronDown, ArrowRight, CheckCircle2, HelpingHand, MapPin
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    mealsRescued: 1610,
    donorsCount: 10,
    ngosCount: 4,
    volunteersCount: 10
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Attempt loading real metrics from database
    api.get('/impact')
      .then(res => {
        if (res?.summary) {
          setStats({
            mealsRescued: res.summary.totalMealsRescued || 1610,
            donorsCount: res.summary.totalDonors || 10,
            ngosCount: res.summary.verifiedNgos || 4,
            volunteersCount: res.summary.activeVolunteers || 10
          });
        }
      })
      .catch(() => {
        // Fallback to static seed estimation if backend server is starting up
      });
  }, []);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50/70 pt-10 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Food Rescuing Tamil Nadu
              </span>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {t('heroTitle')}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <Link
                  to="/register?role=DONOR"
                  className="flex-1 sm:flex-initial text-center px-6 py-3.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {t('btnDonateFood')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link
                  to="/register?role=VOLUNTEER"
                  className="flex-1 sm:flex-initial text-center px-6 py-3.5 font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {t('btnBecomeVolunteer')}
                </Link>
              </div>

            </div>

            {/* Premium Illustration Panel */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="absolute -inset-4 bg-emerald-400/10 rounded-full blur-3xl opacity-75"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full">
                
                {/* Visual Representation of FoodBridge */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                    <span className="text-xl">🏢</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Wedding / Restaurant</h4>
                      <p className="text-[10px] text-slate-500">Post excess: 150 Servings Biryani</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded">Seeded</span>
                  </div>

                  <div className="h-6 border-l-2 border-dashed border-emerald-300 ml-6 relative">
                    <span className="absolute -left-1.5 top-1 bg-emerald-500 text-white rounded-full p-0.5 text-[8px]">⚡</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-xl">🛵</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Volunteer (Courier)</h4>
                      <p className="text-[10px] text-slate-500">Proximity match: 1.8km away</p>
                    </div>
                  </div>

                  <div className="h-6 border-l-2 border-dashed border-blue-300 ml-6 relative">
                    <span className="absolute -left-1.5 top-1 bg-blue-500 text-white rounded-full p-0.5 text-[8px]">✓</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <span className="text-xl">🏠</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Karunai NGO Shelter</h4>
                      <p className="text-[10px] text-slate-500">Safely distribute to 150 children</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Live Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-slate-100">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-extrabold text-emerald-600">{stats.mealsRescued}+</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{t('statMealsRescued')}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.donorsCount}+</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{t('statFoodDonors')}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.ngosCount}+</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{t('statNgoPartners')}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.volunteersCount}+</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{t('statVolunteers')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">The Challenge</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
                {t('problemTitle')}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t('problemText')}
              </p>
              <div className="flex gap-4 items-center">
                <span className="text-4xl">🗑️</span>
                <p className="text-xs text-slate-500 italic">Up to 40% of food prepared for community functions is thrown away simply due to lack of coordination.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">The Solution</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                {t('solutionTitle')}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('solutionText')}
              </p>
              
              <ul className="mt-6 space-y-3">
                {[
                  "Algorithmic proximity matching",
                  "Automated chemical degradation & safety checks",
                  "Zero-leak transparency routing",
                  "Reward points Recognition certificate"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow: How It Works */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Timeline</span>
            <h2 className="text-3xl font-extrabold text-slate-900">{t('howTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-4 block">📝</span>
              <h3 className="font-bold text-slate-800 mb-2">{t('howDonateTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('howDonateDesc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-4 block">🧠</span>
              <h3 className="font-bold text-slate-800 mb-2">{t('howMatchTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('howMatchDesc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-4 block">🛵</span>
              <h3 className="font-bold text-slate-800 mb-2">{t('howPickupTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('howPickupDesc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <span className="text-3xl mb-4 block">🍽️</span>
              <h3 className="font-bold text-slate-800 mb-2">{t('howDistributeTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('howDistributeDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Participate Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">{t('whoTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🏢</span>
                <h3 className="font-bold text-slate-800 text-sm mt-3 mb-2">{t('whoDonor')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('whoDonorDesc')}</p>
              </div>
              <Link to="/register?role=DONOR" className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                Register as Donor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🏠</span>
                <h3 className="font-bold text-slate-800 text-sm mt-3 mb-2">{t('whoNgo')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('whoNgoDesc')}</p>
              </div>
              <Link to="/register?role=NGO" className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                Register as NGO <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🛵</span>
                <h3 className="font-bold text-slate-800 text-sm mt-3 mb-2">{t('whoVolunteer')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('whoVolunteerDesc')}</p>
              </div>
              <Link to="/register?role=VOLUNTEER" className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                Join as Volunteer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 blur-2xl pointer-events-none">
          <div className="w-72 h-72 rounded-full bg-emerald-500"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-bold mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('safetyDisclaimerTitle')}
            </span>
            <h2 className="text-2xl font-extrabold mb-4">Our Strict Food Safety Protocol</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {t('safetyDisclaimerText')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-bold text-emerald-400 mb-1">Time Elapsed Rules</h4>
                <p className="text-slate-400 text-[11px]">Unrefrigerated ambient food is flagged as caution after 3 hours and strictly forbidden after 6 hours from cooking.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-bold text-emerald-400 mb-1">Perishability Ratings</h4>
                <p className="text-slate-400 text-[11px]">Non-veg items, curries, and dairy are monitored with immediate urgency compared to stable dry bakery cargo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">{t('faqTitle')}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors text-xs sm:text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 bg-slate-50 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
