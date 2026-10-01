import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Menu, X, Bell, Globe, LogOut 
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'DONOR': return '/donor-dashboard';
      case 'NGO': return '/ngo-dashboard';
      case 'VOLUNTEER': return '/volunteer-dashboard';
      case 'ADMIN': return '/admin-dashboard';
      default: return '/';
    }
  };

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navImpact'), path: '/impact' },
    { name: 'Need Map', path: '/need-map' }
  ];

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Food Hero': return 'bg-rose-500 text-white';
      case 'Gold': return 'bg-amber-500 text-white';
      case 'Silver': return 'bg-slate-300 text-slate-800';
      default: return 'bg-amber-700 text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl" role="img" aria-label="handshake">🤝</span>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-green-400 transition-colors">
                  FOODBRIDGE AI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user && (
                <Link
                  to={getDashboardPath()}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.includes('dashboard')
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  {t('navDashboard')}
                </Link>
              )}
            </nav>

            {/* Language + Notifications + User Profile Controls */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
              </button>

              {/* Notifications bell Dropdown */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800">Notifications</span>
                        {unreadCount > 0 && <span className="text-[10px] font-semibold text-rose-500">{unreadCount} unread</span>}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n._id || n.id} 
                              onClick={() => markAsRead((n.id || n._id)!)}
                              className={`px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 text-xs transition-colors ${!n.isRead ? 'bg-slate-50/50 border-l-2 border-emerald-500' : ''}`}
                            >
                              <div className="flex-1">
                                <p className="text-slate-700 leading-snug">{language === 'ta' && n.messageTa ? n.messageTa : n.message}</p>
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 self-center"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Session Detail */}
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {user.role}
                      </span>
                      {user.role === 'DONOR' && user.donorProfile?.badge && (
                        <span className={`text-[8px] px-1 rounded font-bold uppercase tracking-wider ${getBadgeColor(user.donorProfile.badge)}`}>
                          {user.donorProfile.badge}
                        </span>
                      )}
                      {user.role === 'NGO' && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    {t('navLogin')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    {t('navRegister')}
                  </Link>
                </div>
              )}

            </div>

            {/* Mobile Menu Icon */}
            <div className="flex items-center md:hidden gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs"
              >
                {language === 'en' ? 'தமிழ்' : 'EN'}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-100 bg-white py-3 px-4 animate-in fade-in duration-150">
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-semibold hover:bg-slate-50 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}

              {user && (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-semibold bg-emerald-50 text-emerald-800 rounded-lg"
                >
                  {t('navDashboard')}
                </Link>
              )}

              {user ? (
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                  <div className="px-3 py-1 text-xs text-slate-500">
                    Logged in as <span className="font-bold text-slate-700">{user.name}</span> ({user.role})
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-base font-semibold text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-3 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-700"
                  >
                    {t('navLogin')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
                  >
                    {t('navRegister')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Social Impact Styled Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <span className="text-xl font-extrabold tracking-tight text-white mb-3 inline-block">
                🤝 FOODBRIDGE AI
              </span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
                Rescue food. Reduce waste. Share meals. We build technology bridges connecting hotels and event halls with local distribution organizations to eradicate hunger.
              </p>
              <p className="text-[10px] text-slate-500 italic max-w-sm">
                * Preliminary safety assessments are helper guidelines only and do not replace visual/sensory checks.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/impact" className="hover:text-white transition-colors">{t('navImpact')}</Link></li>
                <li><Link to="/need-map" className="hover:text-white transition-colors">Need Map</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Become a Volunteer</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Tamil Nadu, India</li>
                <li>support@foodbridge.ai</li>
                <li>+91 (044) 4321-8899</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              &copy; {new Date().getFullYear()} FoodBridge AI Platform. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Safety Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
