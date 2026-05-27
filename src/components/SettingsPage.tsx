/**
 * AirPak Express - Settings Page
 * User profile and account settings
 */

import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Key, Globe, Moon, Sun } from 'lucide-react';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-[#1C1C1E] rounded-2xl p-2 border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#E31837]/10 text-[#E31837]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#E31837] to-[#B01030] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <button className="px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors">
                    Change Photo
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E31837]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E31837]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E31837]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E31837]/50"
                  />
                </div>

                <button className="w-full mt-4 px-6 py-3 bg-[#E31837] text-white rounded-xl font-medium hover:bg-[#B01030] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.email ? 'bg-[#E31837]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">SMS Notifications</p>
                    <p className="text-sm text-gray-400">Receive text message alerts</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.sms ? 'bg-[#E31837]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.push ? 'bg-[#E31837]' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Key size={20} className="text-gray-400" />
                    <span className="font-medium text-white">Change Password</span>
                  </div>
                  <span className="text-gray-400">’</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-gray-400" />
                    <span className="font-medium text-white">Two-Factor Authentication</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Enabled</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <span className="font-medium text-white">Login History</span>
                  </div>
                  <span className="text-gray-400">’</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-6">Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Language</p>
                    <p className="text-sm text-gray-400">Select your preferred language</p>
                  </div>
                  <select className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Chinese</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Timezone</p>
                    <p className="text-sm text-gray-400">Set your local timezone</p>
                  </div>
                  <select className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+8 (China)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-white">Currency</p>
                    <p className="text-sm text-gray-400">Default display currency</p>
                  </div>
                  <select className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white">
                    <option>USD ($)</option>
                    <option>EUR (¬)</option>
                    <option>GBP (£)</option>
                    <option>CNY (¥)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;