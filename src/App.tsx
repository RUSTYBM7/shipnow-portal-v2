import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Package, MapPin,
  Gift, Headphones, User, Search, Bell, Menu, X, ChevronRight,
  Sparkles, TrendingUp, AlertTriangle, Zap, Lightbulb, Truck,
  CheckCircle, Shield, Send, ArrowRight, Navigation,
  Minus, Plus, Compass, Camera, Mic, ArrowUp, ChevronLeft,
  Trophy, DollarSign, Settings, LogOut, BellRing, Check, Clock,
  Eye, EyeOff, Home, FileText, CreditCard, CircleUser, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

import { FullScreenMapTracking } from './features/map-tracking/FullScreenMapTracking';
import { ComingSoon } from './components/ComingSoon';
import { CreateShipmentForm } from './features/shipment/CreateShipmentForm';
import SupportChat from './components/SupportChat';
import { useAppStore, useUser, useNotifications, useUnreadCount } from './lib/store';
import { useShipmentsStore, getShipmentStats } from './lib/shipmentsStore';
import { UnifiedAuthPage } from './features/auth/UnifiedAuthPage';
import { ModernAuth } from './features/auth/ModernAuth';
import PortalLayout from './components/layout/PortalLayout';
import AdminPortalLayout from './components/layout/AdminPortalLayout';

// ============== LAYOUT COMPONENTS ==============

// Sidebar Component - accepts onNavigate prop
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (page: string) => void; currentPage: string }> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const user = useUser();
  const tierColors: Record<string, string> = {
    bronze: 'text-amber-700',
    silver: 'text-gray-500',
    gold: 'text-yellow-600',
    platinum: 'text-purple-600'
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'create', icon: PlusCircle, label: 'New Shipment', highlight: true },
    { id: 'shipments', icon: Package, label: 'Shipments' },
    { id: 'tracking', icon: MapPin, label: 'Tracking' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'rewards', icon: Gift, label: 'Rewards', badge: 'New' },
    { id: 'support', icon: Headphones, label: 'Support' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">AirPak</span>
              <span className="text-xs font-medium text-[#DC143C] bg-red-50 px-2 py-0.5 rounded-full ml-1">ShipNow</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${currentPage === item.id
                  ? 'bg-red-50 text-[#DC143C]'
                  : item.highlight
                    ? 'bg-[#DC143C] text-white hover:bg-[#B01030]'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-[#DC143C] text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Card - clickable */}
        <button
          onClick={() => handleNavClick('profile')}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 hover:bg-gray-50 transition-colors w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#DC143C] to-[#E82545] rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className={`text-xs capitalize ${tierColors[user?.tier || 'bronze']}`}>{user?.tier || 'Bronze'} Member</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>
      </aside>
    </>
  );
};

// Topbar Component
const Topbar: React.FC<{ onMenuClick: () => void; onNavigate: (page: string) => void }> = ({ onMenuClick, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const { markNotificationRead, markAllRead } = useAppStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        <Menu size={24} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shipments..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC143C]"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#DC143C] rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead()} className="text-xs text-[#DC143C] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        setShowNotifications(false);
                        if (notif.actionUrl) onNavigate(notif.actionUrl.replace('/', ''));
                      }}
                      className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 text-left transition-colors ${!notif.read ? 'bg-red-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${!notif.read ? 'bg-[#DC143C]' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <button onClick={() => { setShowNotifications(false); onNavigate('notifications'); }} className="w-full text-center text-sm text-[#DC143C] font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar - clickable */}
        <button
          onClick={() => onNavigate('profile')}
          className="w-9 h-9 bg-gradient-to-br from-[#DC143C] to-[#E82545] rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          JD
        </button>
      </div>
    </header>
  );
};

// Mobile Bottom Nav
const MobileBottomNav: React.FC<{ currentPage: string; onNavigate: (page: string) => void }> = ({ currentPage, onNavigate }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'create', icon: PlusCircle, label: 'Ship' },
    { id: 'shipments', icon: Package, label: 'Orders' },
    { id: 'tracking', icon: MapPin, label: 'Track' },
    { id: 'settings', icon: Settings, label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            {currentPage === tab.id && (
              <div className="absolute -top-0.5 w-12 h-0.5 bg-[#DC143C] rounded-full" />
            )}
            <tab.icon
              size={24}
              className={currentPage === tab.id ? 'text-[#DC143C]' : 'text-gray-400'}
              strokeWidth={currentPage === tab.id ? 2.5 : 2}
            />
            <span className={`text-[10px] mt-0.5 ${currentPage === tab.id ? 'text-[#DC143C] font-medium' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// ============== DASHBOARD COMPONENTS ==============

// Stat Cards
const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: any;
  sparkline: number[];
  onClick?: () => void;
}> = ({ title, value, change, changeType, icon: Icon, sparkline, onClick }) => {
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const range = max - min || 1;

  const points = sparkline.map((v, i) => {
    const x = (i / (sparkline.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <button onClick={onClick} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover w-full text-left">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 font-medium ${
            changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change}
          </p>
        </div>
        <div className="p-2 bg-red-50 rounded-lg">
          <Icon size={20} className="text-[#DC143C]" />
        </div>
      </div>

      <svg className="w-full h-10 mt-3" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={changeType === 'up' ? '#10B981' : changeType === 'down' ? '#EF4444' : '#DC143C'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

// AI Insights Panel - with dismissible cards
const AIInsightsPanel: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: 'saving',
      title: 'Save 23% on your next shipment',
      description: 'Switching to bulk monthly billing could save you $142/month.',
      confidence: 0.94,
    },
    {
      id: 2,
      type: 'prediction',
      title: 'Package arriving early',
      description: 'Shipment #APK88421 is predicted to arrive 1.5 days ahead of schedule.',
      confidence: 0.87,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Verify your address',
      description: 'Your default delivery address needs verification to avoid delays.',
      confidence: 1.0,
    },
  ]);

  const dismissInsight = (id: number) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const typeConfig: Record<string, { icon: any; bg: string; border: string }> = {
    saving: { icon: TrendingUp, bg: 'bg-green-50 text-green-600', border: 'border-l-green-500' },
    prediction: { icon: Zap, bg: 'bg-blue-50 text-blue-600', border: 'border-l-blue-500' },
    alert: { icon: AlertTriangle, bg: 'bg-amber-50 text-amber-600', border: 'border-l-amber-500' },
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#DC143C]" />
          <h3 className="font-semibold text-lg">AI Insights</h3>
          <span className="text-xs bg-red-50 text-[#DC143C] px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">All caught up! Check back later for new insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[#DC143C]" />
        <h3 className="font-semibold text-lg">AI Insights</h3>
        <span className="text-xs bg-red-50 text-[#DC143C] px-2 py-0.5 rounded-full">Beta</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border-l-4 bg-gray-50 ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissInsight(insight.id); }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{insight.description}</p>
                  <button
                    onClick={() => {
                      if (insight.type === 'prediction') onNavigate('tracking');
                      else if (insight.type === 'alert') onNavigate('profile');
                      else onNavigate('create');
                    }}
                    className="inline-flex items-center gap-1 text-sm text-[#DC143C] font-medium mt-2 hover:underline"
                  >
                    Take action <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Recent Shipments
const RecentShipments: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const shipmentsStore = useShipmentsStore();
  const shipments = shipmentsStore.shipments.slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    picked_up: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-blue-100 text-blue-700',
    customs: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    exception: 'bg-red-100 text-red-700',
    returned: 'bg-gray-100 text-gray-700'
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Shipments</h3>
        <button onClick={() => onNavigate('shipments')} className="text-sm text-[#DC143C] font-medium hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {shipments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No shipments yet</p>
          </div>
        ) : (
          shipments.map((shipment) => (
            <button
              key={shipment.id}
              onClick={() => {
                shipmentsStore.setCurrentShipment(shipment);
                onNavigate('tracking');
              }}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-[#DC143C]" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{shipment.tracking_number}</p>
                  <p className="text-xs text-gray-500">{shipment.destination?.city}, {shipment.destination?.country}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[shipment.status]}`}>
                  {formatStatus(shipment.status)}
                </span>
                <p className="text-xs text-gray-400 mt-1">{formatDate(shipment.created_at)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// Quick Actions - vertical buttons
const QuickActions: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const actions = [
    { id: 'create', icon: PlusCircle, label: 'New Shipment', color: 'bg-[#DC143C]', description: 'Create a new shipment' },
    { id: 'tracking', icon: MapPin, label: 'Track Package', color: 'bg-blue-500', description: 'Track your orders' },
    { id: 'support', icon: Headphones, label: 'Support', color: 'bg-purple-500', description: 'Chat with us' },
    { id: 'rewards', icon: Gift, label: 'Rewards', color: 'bg-amber-500', description: 'View points & perks' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onNavigate(action.id)}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover text-left"
        >
          <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
            <action.icon size={24} className="text-white" />
          </div>
          <p className="font-semibold text-gray-900">{action.label}</p>
          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  );
};

// ============== SHIPMENT WIZARD ==============

const CreateShipmentWizard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: 'Origin' },
    { id: 2, label: 'Destination' },
    { id: 3, label: 'Package' },
    { id: 4, label: 'Service' },
    { id: 5, label: 'Review' },
  ];

  const [formData, setFormData] = useState({
    origin: { country: 'Singapore', city: 'Singapore', address: '' },
    destination: { country: '', city: '', address: '' },
    package: { weight: '', description: '' },
    service: 'express',
  });

  const [submitted, setSubmitted] = useState(false);

  const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                current > step.id
                  ? 'bg-green-500 text-white'
                  : current === step.id
                    ? 'bg-[#DC143C] text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {current > step.id ? <Check size={20} /> : step.id}
            </div>
            <p className={`text-xs mt-2 ${current >= step.id ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded ${current > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const AISuggestions: React.FC = () => {
    const suggestions = [];
    if (currentStep === 1 && formData.origin.country === 'Singapore') {
      suggestions.push({ icon: Lightbulb, text: 'Same-day pickup available if booked before 2 PM' });
    }
    if (currentStep === 3 && Number(formData.package.weight) > 20) {
      suggestions.push({ icon: Truck, text: 'For 20kg+ packages, freight service is 40% cheaper' });
    }
    if (currentStep === 4 && formData.destination.country === 'United Kingdom') {
      suggestions.push({ icon: Shield, text: 'UK customs pre-clearance saves 1-2 days' });
    }
    if (suggestions.length === 0) return null;

    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#DC143C]" />
          <h4 className="font-medium text-sm text-[#DC143C]">AI Suggestions</h4>
        </div>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <s.icon size={14} className="text-[#DC143C] mt-0.5" />
              <p className="text-gray-700">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Shipment Created!</h2>
        <p className="text-gray-500 mb-6">Your shipment APK{Math.floor(Math.random() * 900000) + 100000} has been created successfully.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => onNavigate('tracking')} className="px-6 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030]">
            Track Shipment
          </button>
          <button onClick={() => { setCurrentStep(1); setSubmitted(false); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
            New Shipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create Shipment</h1>
      <p className="text-gray-500 mb-6">Ship to 220+ countries with AirPak Express</p>

      <StepIndicator current={currentStep} />

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Origin Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={formData.origin.country}
                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, country: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
              >
                <option>Singapore</option>
                <option>United Kingdom</option>
                <option>Hong Kong</option>
                <option>Malaysia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.origin.city}
                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, city: e.target.value } })}
                placeholder="Singapore"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
              />
            </div>
            <button onClick={() => setCurrentStep(2)} className="w-full py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Destination</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={formData.destination.country}
                onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, country: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
              >
                <option value="">Select country</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Australia</option>
                <option>Germany</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.destination.city}
                onChange={(e) => setFormData({ ...formData, destination: { ...formData.destination, city: e.target.value } })}
                placeholder="London"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Back</button>
              <button onClick={() => setCurrentStep(3)} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Package Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.package.weight}
                  onChange={(e) => setFormData({ ...formData, package: { ...formData.package, weight: e.target.value } })}
                  placeholder="5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.package.description}
                  onChange={(e) => setFormData({ ...formData, package: { ...formData.package, description: e.target.value } })}
                  placeholder="Electronics"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC143C]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(2)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Back</button>
              <button onClick={() => setCurrentStep(4)} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Service</h3>
            {[
              { id: 'express', name: 'Express Delivery', time: '2-4 days', price: '$45', icon: Zap },
              { id: 'standard', name: 'Standard Shipping', time: '5-10 days', price: '$25', icon: Truck },
              { id: 'economy', name: 'Economy', time: '10-20 days', price: '$15', icon: Package },
            ].map((service) => (
              <label
                key={service.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.service === service.id ? 'border-[#DC143C] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={formData.service === service.id}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="sr-only"
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.service === service.id ? 'bg-[#DC143C] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <service.icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.time}</p>
                </div>
                <p className="text-lg font-bold text-[#DC143C]">{service.price}</p>
              </label>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(3)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Back</button>
              <button onClick={() => setCurrentStep(5)} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
                Review <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Review & Confirm</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">From</span>
                <span className="font-medium">{formData.origin.city}, {formData.origin.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">To</span>
                <span className="font-medium">{formData.destination.city}, {formData.destination.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Package</span>
                <span className="font-medium">{formData.package.weight}kg - {formData.package.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium capitalize">{formData.service}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#DC143C]">$45.00</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(4)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Back</button>
              <button onClick={() => setSubmitted(true)} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
                Create Shipment <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AISuggestions />
    </div>
  );
};

// ============== LOGIN PAGE ==============

const LoginPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login - redirect to dashboard
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to your AirPak account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button type="button" onClick={() => toast.success('Password reset link sent to your email')} className="text-sm text-[#DC143C] hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#DC143C] to-[#E82545] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => toast.error('Google login currently unavailable')} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button type="button" onClick={() => toast.error('GitHub login currently unavailable')} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#DC143C] font-medium hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

// ============== REGISTER PAGE ==============

const RegisterPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    // Demo registration - redirect to dashboard
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Join AirPak Express today</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-slate-600 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
              />
              <span className="text-sm text-slate-400">
                I agree to the{' '}
                <button type="button" onClick={() => toast('Terms of Service will open in a new tab')} className="text-[#DC143C] hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" onClick={() => toast('Privacy Policy will open in a new tab')} className="text-[#DC143C] hover:underline">Privacy Policy</button>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#DC143C] to-[#E82545] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#DC143C] font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

// ============== TRACKING PAGE ==============

const TrackingPage: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [searchHistory, setSearchHistory] = useState(['APK20240525001234', 'APK20240524001233', 'APK20240523001232']);

  const trackingData = {
    id: 'APK20240525001234',
    status: 'In Transit',
    origin: 'Singapore (SIN)',
    destination: 'London (LHR)',
    estimatedDelivery: 'May 28, 2024',
    events: [
      { id: 1, status: 'Picked Up', location: 'Singapore', date: 'May 23, 10:00', lat: 1.3521, lng: 103.8198, completed: true },
      { id: 2, status: 'Customs Cleared', location: 'Singapore', date: 'May 23, 16:00', lat: 1.3521, lng: 103.8198, completed: true },
      { id: 3, status: 'Departed', location: 'Singapore', date: 'May 24, 08:00', lat: 1.3644, lng: 103.9915, completed: true },
      { id: 4, status: 'In Transit', location: 'London Heathrow', date: 'May 25, 14:30', lat: 51.4700, lng: -0.4543, completed: true },
      { id: 5, status: 'Arrived', location: 'London', date: 'May 26, 06:00', lat: 51.4700, lng: -0.4543, completed: false },
      { id: 6, status: 'Delivered', location: 'London', date: 'May 28', lat: 51.5074, lng: -0.1278, completed: false },
    ],
  };

  const bounds = {
    minLat: 1.3, maxLat: 52,
    minLng: 103.8, maxLng: -0.4,
  };

  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (!searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      setShowResults(true);
    }
  };

  const quickCategories = [
    { name: 'Fast Food', icon: '🍔' },
    { name: 'Gas Stations', icon: '⛽' },
    { name: 'Shopping', icon: '🛒' },
    { name: 'Restaurants', icon: '🍽️' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header with Search */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Track Shipment</h1>
        <p className="text-gray-500">Real-time tracking with live updates</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex-1 flex items-center px-4">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking number..."
              className="w-full px-3 py-4 text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-4 bg-[#DC143C] text-white font-medium hover:bg-[#B01030] transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {quickCategories.map((cat) => (
          <button
            key={cat.name}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm whitespace-nowrap hover:border-[#DC143C] transition-colors"
          >
            <span>{cat.icon}</span>
            <span className="text-gray-700">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-inner bg-gradient-to-b from-sky-200 to-green-100" style={{ height: '55vh' }}>
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 2))}
            className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} className="text-gray-700" />
          </button>
          <button
            onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Map Content - SVG World Map */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {/* Background gradient */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#90EE90" />
            </linearGradient>
            <pattern id="landPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1" fill="#90EE90" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mapGradient)" />
          <rect width="100" height="100" fill="url(#landPattern)" />

          {/* Simplified continents */}
          {/* Europe */}
          <path d="M48 20 Q52 18 55 22 Q58 26 54 30 Q50 34 48 32 Q45 28 48 20Z" fill="#90EE90" opacity="0.7" />
          {/* UK */}
          <path d="M46 18 Q48 16 50 18 Q52 20 50 24 Q48 28 46 26 Q44 22 46 18Z" fill="#90EE90" opacity="0.7" />
          {/* Africa */}
          <path d="M48 35 Q55 32 58 38 Q62 45 58 55 Q52 62 48 58 Q44 50 48 35Z" fill="#90EE90" opacity="0.7" />
          {/* Asia */}
          <path d="M60 20 Q75 15 85 25 Q90 35 85 42 Q75 45 65 40 Q58 32 60 20Z" fill="#90EE90" opacity="0.7" />
          {/* Southeast Asia */}
          <path d="M72 38 Q80 35 85 42 Q88 48 82 52 Q74 52 70 46 Q68 40 72 38Z" fill="#90EE90" opacity="0.7" />
          {/* Australia */}
          <path d="M78 55 Q88 52 92 58 Q94 65 88 70 Q80 68 76 62 Q74 56 78 55Z" fill="#90EE90" opacity="0.7" />
          {/* North America */}
          <path d="M10 15 Q25 10 35 18 Q42 25 38 35 Q30 42 20 38 Q12 32 10 15Z" fill="#90EE90" opacity="0.7" />
          {/* South America */}
          <path d="M22 42 Q32 40 35 48 Q38 58 32 68 Q25 72 20 62 Q18 52 22 42Z" fill="#90EE90" opacity="0.7" />

          {/* Grid lines */}
          {[25, 50, 75].map(pos => (
            <g key={pos}>
              <line x1={pos} y1="0" x2={pos} y2="100" stroke="#fff" strokeWidth="0.1" opacity="0.3" />
              <line x1="0" y1={pos} x2="100" y2={pos} stroke="#fff" strokeWidth="0.1" opacity="0.3" />
            </g>
          ))}
        </svg>

        {/* Route Line */}
        {showResults && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradPortal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007AFF" />
                <stop offset="50%" stopColor="#5856D6" />
                <stop offset="100%" stopColor="#34C759" />
              </linearGradient>
            </defs>
            {/* Route shadow */}
            <polyline
              points={trackingData.events.map(e => {
                const { x, y } = project(e.lat, e.lng);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="rgba(0,122,255,0.2)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated route */}
            <polyline
              points={trackingData.events.map(e => {
                const { x, y } = project(e.lat, e.lng);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="url(#routeGradPortal)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,8"
              className="animate-dash"
            />
          </svg>
        )}

        {/* Map Pins */}
        {showResults && trackingData.events.map((event, i) => {
          const { x, y } = project(event.lat, event.lng);
          const isCurrent = i === trackingData.events.length - 2;
          const isCompleted = event.completed;

          return (
            <button
              key={event.id}
              onClick={() => setSelectedPin(selectedPin?.id === event.id ? null : event)}
              className="absolute transform -translate-x-1/2 -translate-y-full transition-all hover:scale-110 z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                  <path
                    d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z"
                    fill={isCurrent ? '#FF3B30' : isCompleted ? '#007AFF' : '#8E8E93'}
                  />
                  <circle cx="16" cy="16" r="5" fill="white" />
                  {isCompleted && (
                    <path d="M13 16l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
                    <div className="w-3 h-3 bg-red-500 rounded-full absolute inset-0" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Pin Callout */}
        {selectedPin && (
          <div className="absolute top-4 left-4 z-30 bg-white rounded-2xl shadow-2xl p-4 min-w-[220px] animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedPin.completed ? 'bg-blue-500' : 'bg-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">{selectedPin.status}</h3>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={14} className="text-[#DC143C]" />
                {selectedPin.location}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Clock size={14} />
                {selectedPin.date}
              </p>
            </div>
            {selectedPin.completed && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle size={14} />
                  <span>Completed</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Sheet - Slides up when results are shown */}
        {showResults && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-6">
              {/* Tracking Info Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <p className="font-bold text-gray-900">{trackingData.id}</p>
                </div>
                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {trackingData.status}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="text-sm font-semibold text-gray-900">{trackingData.origin}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  <p className="text-sm font-semibold text-gray-900">{trackingData.destination}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Est. Delivery</p>
                  <p className="text-sm font-semibold text-[#DC143C]">{trackingData.estimatedDelivery}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-5">
                <button onClick={() => toast.success('Details loaded')} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#B01030] transition-colors">
                  <Navigation size={16} />
                  View Details
                </button>
                <button onClick={() => toast.success('Tracking link copied to clipboard!')} className="py-3 px-5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Share
                </button>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Tracking History</h4>
                <div className="space-y-3 max-h-44 overflow-y-auto pr-2">
                  {trackingData.events.slice().reverse().map((event, i) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${event.completed ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        {i < trackingData.events.length - 1 && (
                          <div className={`w-0.5 h-10 mt-0.5 ${event.completed ? 'bg-blue-200' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                        <p className="text-xs text-gray-500">{event.location} • {event.date}</p>
                      </div>
                      {event.completed && (
                        <Check size={14} className="text-blue-500 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search History (when no results) */}
        {!showResults && searchHistory.length > 0 && (
          <div className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-20">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h4>
            <div className="space-y-2">
              {searchHistory.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSearchQuery(id);
                    setShowResults(true);
                  }}
                  className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">{id}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============== REWARDS PAGE ==============

const RewardsPage: React.FC = () => {
  const [userPoints] = useState(1240);

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: '#CD7F32', benefits: ['5% off base rates', 'Standard support'] },
    { name: 'Silver', minPoints: 500, color: '#C0C0C0', benefits: ['10% off rates', 'Priority support', 'Free packaging'] },
    { name: 'Gold', minPoints: 2000, color: '#FFD700', benefits: ['15% off rates', 'Dedicated agent', 'Free insurance'] },
    { name: 'Platinum', minPoints: 5000, color: '#E5E4E2', benefits: ['20% off rates', 'White-glove service', 'Custom API'] },
  ];

  const currentTier = tiers.slice().reverse().find(t => userPoints >= t.minPoints) || tiers[0];
  const nextTier = tiers.find(t => t.minPoints > userPoints);
  const progress = nextTier ? (userPoints / nextTier.minPoints) * 100 : 100;

  const rewards = [
    { name: 'Free Express Upgrade', points: 200, icon: Zap, available: true },
    { name: '$10 Shipping Credit', points: 500, icon: DollarSign, available: true },
    { name: 'Priority Handling', points: 300, icon: Truck, available: true },
    { name: 'Custom Packaging', points: 400, icon: Package, available: false },
    { name: 'Dedicated Support', points: 800, icon: Headphones, available: false },
    { name: 'Rate Lock (1 month)', points: 1000, icon: Shield, available: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">AirPak Rewards</h1>
        <p className="text-gray-500">Ship more, earn more, save more</p>
      </div>

      {/* Tier Card */}
      <div className="bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">{currentTier.name} Member</p>
            <p className="text-4xl font-bold mt-1">{userPoints.toLocaleString()}</p>
            <p className="text-red-100 text-sm mt-2">
              {nextTier ? `${(nextTier.minPoints - userPoints).toLocaleString()} points to ${nextTier.name}` : 'Maximum tier!'}
            </p>
          </div>
          <Trophy size={64} className="text-red-200 opacity-50" />
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="h-2 bg-red-800/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-red-100 mt-1 text-right">{Math.round(progress)}% to {nextTier.name}</p>
          </div>
        )}
      </div>

      {/* Tier Progression */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-4 rounded-xl border-2 text-center ${
              tier.name === currentTier.name
                ? 'border-[#DC143C] bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Trophy size={32} style={{ color: tier.color }} className="mx-auto mb-2" />
            <h3 className="font-semibold">{tier.name}</h3>
            <p className="text-xs text-gray-500">{tier.minPoints.toLocaleString()}+ pts</p>
          </div>
        ))}
      </div>

      {/* Redeemable Rewards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Redeem Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, i) => (
            <button
              key={i}
              disabled={!reward.available}
              className={`p-4 rounded-xl border text-left transition-all ${
                reward.available
                  ? 'border-gray-200 bg-white hover:border-[#DC143C] card-hover'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <reward.icon size={24} className="text-[#DC143C] mb-2" />
              <h3 className="font-medium text-sm">{reward.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{reward.points} points</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== PROFILE PAGE ==============


// ============== SHIPMENTS PAGE ==============

const ShipmentsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const shipmentsStore = useShipmentsStore();
  const allShipments = shipmentsStore.shipments;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    picked_up: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-blue-100 text-blue-700',
    customs: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    exception: 'bg-red-100 text-red-700',
    returned: 'bg-gray-100 text-gray-700'
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatService = (service: string) => {
    return service.charAt(0).toUpperCase() + service.slice(1);
  };

  // Filter shipments
  const filteredShipments = allShipments.filter(shipment => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shipment.destination?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shipment.destination?.country?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Shipments</h1>
          <p className="text-gray-500">{filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => onNavigate('create')} className="px-4 py-2 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] flex items-center justify-center gap-2">
          <PlusCircle size={18} />
          New Shipment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number or destination..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC143C]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC143C]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="space-y-3">
        {shipmentsStore.isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
            <p className="text-gray-500 mb-4">
              {allShipments.length === 0 ? 'Create your first shipment to get started' : 'Try adjusting your search or filters'}
            </p>
            {allShipments.length === 0 && (
              <button onClick={() => onNavigate('create')} className="px-4 py-2 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030]">
                Create Shipment
              </button>
            )}
          </div>
        ) : (
          <>
            {paginatedShipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => {
                  shipmentsStore.setCurrentShipment(shipment);
                  onNavigate(`tracking?id=${shipment.tracking_number}`);
                }}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-[#DC143C] transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">{shipment.tracking_number}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[shipment.status]}`}>
                    {formatStatus(shipment.status)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Destination</p>
                    <p className="font-medium">{shipment.destination?.city}, {shipment.destination?.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Weight</p>
                    <p className="font-medium">{shipment.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Service</p>
                    <p className="font-medium">{formatService(shipment.service)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Created: {formatDate(shipment.created_at)}</p>
              </button>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Landing page - Exact marketing page from original main domain
const LandingPage: React.FC = () => {
  // Redirect handlers to user portal
  const handleSignUp = () => {
    window.location.href = 'https://3dffqp1hnmqv.space.minimax.io/#/register';
  };

  const handleSignIn = () => {
    window.location.href = 'https://3dffqp1hnmqv.space.minimax.io/#/login';
  };

  const services = [
    { icon: Globe, title: 'International Shipping', desc: 'Ship to over 150 countries with competitive rates and fast delivery times.', features: ['Express 2-5 days', 'Economy 7-14 days', 'Door-to-door service'] },
    { icon: Zap, title: 'Express Delivery', desc: 'Urgent shipments? Our express service ensures next-day delivery to major cities.', features: ['Same day pickup', 'Priority customs', 'Real-time updates'] },
    { icon: Package, title: 'Warehousing', desc: 'Store your packages in our secure facilities before shipping worldwide.', features: ['Climate controlled', '48hr free storage', 'Inventory management'] },
    { icon: Shield, title: 'Insurance & Security', desc: 'Protect your valuable shipments with our comprehensive insurance options.', features: ['Full coverage', 'Claims in 48hrs', 'Package protection'] },
  ];

  const stats = [
    { value: '150+', label: 'Countries Served' },
    { value: '1M+', label: 'Packages Delivered' },
    { value: '99.8%', label: 'On-Time Delivery' },
  ];

  const testimonials = [
    { quote: 'AirPak Express has transformed our international shipping. Fast, reliable, and the tracking system is amazing!', name: 'Sarah Chen', role: 'E-commerce Owner', initials: 'SC' },
    { quote: 'Best shipping service I have ever used. Their express delivery saved my business deal multiple times.', name: 'Michael Wong', role: 'Business Executive', initials: 'MW' },
    { quote: 'Love how easy it is to track my packages. Customer support is always helpful and responsive.', name: 'Emma Thompson', role: 'Frequent Shipper', initials: 'ET' },
  ];

  const companyStats = [
    { value: '15+', label: 'Years Experience' },
    { value: '500+', label: 'Team Members' },
    { value: '50+', label: 'Global Hubs' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-lg flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-900">AirPak Express</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-gray-600 hover:text-gray-900 font-medium">Home</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">Services</button>
            <button onClick={() => window.location.href = 'https://3dffqp1hnmqv.space.minimax.io/#/tracking'} className="text-gray-600 hover:text-gray-900 font-medium">Track</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">About</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">Contact</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={handleSignIn} className="text-gray-600 hover:text-gray-900 font-medium">Sign In</button>
            <button onClick={handleSignUp} className="bg-[#DC143C] text-white px-5 py-2 rounded-full font-medium hover:bg-[#B01030] transition-colors">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Fast & Reliable<br/><span className="text-[#DC143C]">International Shipping</span></h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Send packages anywhere in the world with AirPak Express. Fast customs clearance, real-time tracking, and secure delivery guaranteed.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => window.location.href = 'https://3dffqp1hnmqv.space.minimax.io/#/tracking'} className="w-full sm:w-auto bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">Track Your Shipment</button>
              <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-[#DC143C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#B01030] transition-colors">Our Services</button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl md:text-4xl font-bold text-[#DC143C]">{stat.value}</p>
                  <p className="text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Track Section */}
        <section id="tracking" className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Track Your Package</h2>
            <p className="text-gray-500 mb-8">Enter your tracking number to get instant updates on your shipment location and estimated delivery time.</p>
            <div className="flex gap-2 max-w-lg mx-auto">
              <input type="text" placeholder="Enter tracking number" className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#DC143C]" />
              <button onClick={() => window.location.href = 'https://3dffqp1hnmqv.space.minimax.io/#/tracking'} className="px-6 py-3 bg-[#DC143C] text-white rounded-full font-bold hover:bg-[#B01030]">Track</button>
            </div>
            <p className="text-sm text-gray-400 mt-4">Popular: APK20240525001234, APK20240524001233</p>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Shipping Solutions</h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">From express delivery to international freight, we offer a full range of logistics services tailored to your needs.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#DC143C]" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{service.desc}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="text-[#DC143C]">*</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Your Trusted Partner in Global Logistics</h2>
              <p className="text-gray-500 mb-4">Founded with a mission to make international shipping accessible and reliable, AirPak Express has grown to become a leading name in the logistics industry. We combine cutting-edge technology with personalized service to deliver exceptional shipping experiences.</p>
              <p className="text-gray-500">Our network spans across 150+ countries, supported by strategically located hubs and partnerships with major airlines and freight carriers.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {companyStats.map((stat, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#DC143C]">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                  <p className="text-gray-600 mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#DC143C] rounded-full flex items-center justify-center text-white font-bold">{t.initials}</div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-500 mb-8">Have questions or need assistance? Our team is ready to help you with any inquiries.</p>
              <div className="space-y-4 text-sm">
                <p className="font-semibold">Headquarters</p>
                <p className="text-gray-500">Singapore Changi Airport<br/>Cargo Terminal, Singapore 918146</p>
                <p className="font-semibold mt-4">Phone</p>
                <p className="text-gray-500">+65 6340 1234 / +65 6340 5678</p>
                <p className="font-semibold mt-4">Email</p>
                <p className="text-gray-500">support@airpak-express.com</p>
                <p className="font-semibold mt-4">Business Hours</p>
                <p className="text-gray-500">Mon - Fri: 9:00 AM - 6:00 PM<br/>Sat - Sun: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">Send us a message</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC143C]" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC143C]" />
                <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DC143C]"></textarea>
                <button className="w-full py-3 bg-[#DC143C] text-white rounded-xl font-bold hover:bg-[#B01030]">Send Message</button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-lg flex items-center justify-center">
                    <Package className="text-white w-5 h-5" />
                  </div>
                  <span className="font-bold text-xl">AirPak Express</span>
                </div>
                <p className="text-gray-400 text-sm">Fast, reliable, and secure international shipping services connecting you to over 150 countries worldwide.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button className="hover:text-white">Track Shipment</button></li>
                  <li><button className="hover:text-white">Services</button></li>
                  <li><button className="hover:text-white">Pricing</button></li>
                  <li><button className="hover:text-white">FAQ</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button className="hover:text-white">About Us</button></li>
                  <li><button className="hover:text-white">Careers</button></li>
                  <li><button className="hover:text-white">News</button></li>
                  <li><button className="hover:text-white">Partners</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button className="hover:text-white">Privacy Policy</button></li>
                  <li><button className="hover:text-white">Terms of Service</button></li>
                  <li><button className="hover:text-white">Cookie Policy</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">© 2024 AirPak Express. All rights reserved.</p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-white text-sm">Singapore</button>
                <button className="text-gray-400 hover:text-white text-sm">United Kingdom</button>
                <button className="text-gray-400 hover:text-white text-sm">Hong Kong</button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// ============== ADMIN AUTH PAGE IMPORTS ==============
import { AdminSignIn } from './features/auth/AdminSignIn';
import { Admin2FA } from './features/auth/Admin2FA';
import { AdminForgotPassword } from './features/auth/AdminForgotPassword';
import { AdminResetPassword } from './features/auth/AdminResetPassword';

// Import additional features for routes
import { PaymentDashboard } from './features/payments/PaymentDashboard';
import { ShipmentsPage as ShipmentsPageComponent } from './features/shipment/ShipmentsPage';
import RewardsPageComponent from './components/RewardsPage';
import AdminDashboardPage from './features/admin/AdminDashboard';
import TrackingPageComponent from './components/TrackingPage';
import SettingsPage from './components/SettingsPage';

// ============== MAIN APP WITH PROPER ROUTING ==============

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - Start with Auth Page (Modern ChatGPT-style auth) */}
      <Route path="/" element={<ModernAuth />} />
      <Route path="/login" element={<ModernAuth />} />
      <Route path="/auth" element={<ModernAuth />} />
      {/* Legacy UnifiedAuthPage kept under /legacy-auth for reference */}
      <Route path="/legacy-auth" element={<UnifiedAuthPage />} />

      {/* User Portal Routes with Layout */}
      <Route path="/portal" element={<PortalLayout><PortalDashboard /></PortalLayout>} />
      <Route path="/portal/dashboard" element={<PortalLayout><PortalDashboard /></PortalLayout>} />
      <Route path="/portal/create" element={<PortalLayout><CreateShipmentFormWrapper /></PortalLayout>} />
      <Route path="/portal/shipments" element={<PortalLayout><ShipmentsPageComponent /></PortalLayout>} />
      <Route path="/portal/tracking" element={<PortalLayout><TrackingPageComponent /></PortalLayout>} />
      <Route path="/portal/payments" element={<PortalLayout><PaymentDashboard /></PortalLayout>} />
      <Route path="/portal/rewards" element={<PortalLayout><RewardsPageComponent /></PortalLayout>} />
      <Route path="/portal/support" element={<PortalLayout><PortalSupportPage /></PortalLayout>} />
      <Route path="/portal/settings" element={<PortalLayout><PortalProfilePage /></PortalLayout>} />
      <Route path="/portal/profile" element={<PortalLayout><PortalProfilePage /></PortalLayout>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminSignIn />} />
      <Route path="/admin/login" element={<AdminSignIn />} />
      <Route path="/admin/2fa" element={<Admin2FA />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
      <Route path="/admin/portal" element={<AdminPortalLayout><AdminDashboardPage /></AdminPortalLayout>} />

      {/* Legacy hash routes - Redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Portal wrapper components
const PortalDashboard: React.FC = () => {
  const user = useUser();
  const shipmentsState = useShipmentsStore();
  const stats = getShipmentStats(shipmentsState.shipments);
  const navigate = useNavigate();

  const handleNavigate = (page: string) => navigate(`/portal/${page.replace('/', '')}`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</p>
      </div>

      <QuickActions onNavigate={handleNavigate} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard onClick={() => navigate('/portal/shipments')} title="Active Shipments" value={stats.active.toString()} change="+3 this week" changeType="up" icon={Package} sparkline={[5, 8, 6, 10, 8, 12, stats.active]} />
        <StatCard onClick={() => navigate('/portal/tracking')} title="In Transit" value={stats.inTransit.toString()} change="2 arriving today" changeType="up" icon={Truck} sparkline={[3, 4, 5, 4, 6, 5, stats.inTransit]} />
        <StatCard title="Delivered" value={stats.delivered.toString()} change="+12 this month" changeType="up" icon={CheckCircle} sparkline={[30, 32, 35, 38, 42, 45, stats.delivered]} />
        <StatCard title="Total Shipments" value={stats.total.toString()} change="+5 this month" changeType="up" icon={DollarSign} sparkline={[5, 8, 10, 12, 15, 18, stats.total]} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AIInsightsPanel onNavigate={handleNavigate} />
        <RecentShipments onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

const CreateShipmentFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <CreateShipmentForm onComplete={(id) => navigate(`/portal/tracking?id=${id}`)} onCancel={() => navigate('/portal')} />;
};

const PortalShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => navigate(`/portal/${page}`);
  return <ShipmentsPage onNavigate={handleNavigate} />;
};

const PortalSupportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Support</h1>
      <p className="text-gray-500 mb-6">We're here to help 24/7</p>
      <SupportChat />
    </div>
  );
};

const PortalProfilePage: React.FC = () => {
  const navigate = useNavigate();
  return <SettingsPage onNavigate={(page) => navigate(`/portal/${page}`)} />;
};

export default App;