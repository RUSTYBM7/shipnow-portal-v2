/**
 * AirPak Express - User Portal Layout
 * Responsive sidebar layout with dark theme
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Package, MapPin,
  Gift, Headphones, Settings, LogOut, Menu, X,
  Bell, Search, User, Home, CreditCard, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PortalLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { path: '/portal', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/portal/create', icon: PlusCircle, label: 'New Shipment', highlight: true },
    { path: '/portal/shipments', icon: Package, label: 'Shipments' },
    { path: '/portal/tracking', icon: MapPin, label: 'Tracking' },
    { path: '/portal/payments', icon: CreditCard, label: 'Payments' },
    { path: '/portal/rewards', icon: Gift, label: 'Rewards' },
    { path: '/portal/support', icon: Headphones, label: 'Support' },
    { path: '/portal/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const tierColors: Record<string, string> = {
    bronze: 'text-amber-700',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400'
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#141416] border-r border-white/[0.06] z-50
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31837] to-[#B01030] rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">AirPak</span>
              <span className="text-xs font-medium text-[#E31837] bg-red-500/10 px-2 py-0.5 rounded-full ml-1">ShipNow</span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${isActive(item.path, item.exact)
                  ? 'bg-[#E31837]/10 text-[#E31837]'
                  : item.highlight
                    ? 'bg-[#E31837] text-white hover:bg-[#B01030]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">New</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
          <Link
            to="/portal/profile"
            className="flex items-center gap-3 mb-3 hover:bg-white/[0.05] rounded-xl p-2 -m-2 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31837] to-[#B01030] rounded-full flex items-center justify-center text-white font-bold">
              {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{profile?.name || 'User'}</p>
              <p className={`text-xs capitalize ${tierColors[profile?.tier || 'bronze']}`}>
                {profile?.tier || 'bronze'} Member
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/[0.06] h-16 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-white/50 hover:bg-white/[0.05] rounded-lg"
          >
            <Menu size={24} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search shipments..."
              className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E31837]/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white/50 hover:bg-white/[0.05] rounded-lg"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E31837] rounded-full text-white text-[10px] flex items-center justify-center">3</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#141416] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <button className="text-xs text-[#E31837] hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 border-b border-white/[0.06] hover:bg-white/[0.02] cursor-pointer">
                      <p className="text-sm text-white">Package delivered successfully</p>
                      <p className="text-xs text-white/40 mt-1">APK20240525001234 - 2 hours ago</p>
                    </div>
                    <div className="p-4 border-b border-white/[0.06] hover:bg-white/[0.02] cursor-pointer">
                      <p className="text-sm text-white">Payment received</p>
                      <p className="text-xs text-white/40 mt-1">$45.00 - 5 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <Link
              to="/portal/profile"
              className="w-9 h-9 bg-gradient-to-br from-[#E31837] to-[#B01030] rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#141416] border-t border-white/[0.06] z-40">
        <div className="flex justify-around items-center h-16">
          {[
            { path: '/portal', icon: Home, label: 'Home' },
            { path: '/portal/create', icon: PlusCircle, label: 'Ship' },
            { path: '/portal/shipments', icon: Package, label: 'Orders' },
            { path: '/portal/tracking', icon: MapPin, label: 'Track' },
            { path: '/portal/settings', icon: Settings, label: 'More' },
          ].map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center w-full h-full relative text-white/40"
            >
              {isActive(tab.path, tab.path === '/portal') && (
                <div className="absolute -top-0.5 w-10 h-0.5 bg-[#E31837] rounded-full" />
              )}
              <tab.icon
                size={24}
                className={isActive(tab.path, tab.path === '/portal') ? 'text-[#E31837]' : ''}
              />
              <span className={`text-[10px] mt-0.5 ${isActive(tab.path, tab.path === '/portal') ? 'text-[#E31837] font-medium' : ''}`}>
                {tab.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default PortalLayout;
