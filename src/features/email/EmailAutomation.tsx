/**
 * AirPak Express - Enhanced Email Automation System
 * Complete email marketing and automation solution
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Inbox, Trash2, Search, Clock, Loader2, Plus,
  ChevronDown, ChevronRight, FileText, XCircle, Settings, MoreVertical,
  BarChart3, Users, MailOpen, AlertCircle, CheckCircle2, X,
  RefreshCw, Eye, Edit3, Calendar, Zap, Globe, Lock, Server,
  TrendingUp, TrendingDown, Activity, Filter, Star, Archive
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ZOHO_CONFIG = {
  smtp: { server: 'smtppro.zoho.com', port_ssl: 465, port_tls: 587 },
  credentials: { email: 'Admin@airpak-express.site' }
};

type EmailStatus = 'draft' | 'queued' | 'sent' | 'failed' | 'delivered' | 'opened' | 'bounced';
type EmailCategory = 'shipment' | 'invoice' | 'notification' | 'marketing' | 'system' | 'support';

interface Email {
  id: string;
  to: string;
  subject: string;
  preview: string;
  html: string;
  status: EmailStatus;
  category: EmailCategory;
  sentAt?: string;
  from: string;
  createdAt: string;
  openedAt?: string;
  deliveredAt?: string;
  clickRate?: number;
  openRate?: number;
}

interface SMTPSettings {
  provider: 'zoho' | 'sendgrid' | 'ses' | 'smtp';
  server: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  useSSL: boolean;
}

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

const DEMO_EMAILS: Email[] = [
  { id: '1', to: 'john@example.com', subject: 'Shipment Created - APK1234567890', preview: 'Your shipment has been created and is being processed. Track your package in real-time with our advanced tracking system.', html: '', status: 'delivered', category: 'shipment', sentAt: new Date(Date.now()-3600000).toISOString(), from: ZOHO_CONFIG.credentials.email, createdAt: new Date(Date.now()-3600000).toISOString(), deliveredAt: new Date(Date.now()-3500000).toISOString(), openRate: 85 },
  { id: '2', to: 'sarah@example.com', subject: 'Invoice #INV-2024-001 - Payment Due', preview: 'Please find attached invoice for services rendered. Payment is due within 30 days.', html: '', status: 'opened', category: 'invoice', sentAt: new Date(Date.now()-86400000).toISOString(), from: ZOHO_CONFIG.credentials.email, createdAt: new Date(Date.now()-86400000).toISOString(), openedAt: new Date(Date.now()-43200000).toISOString(), openRate: 92 },
  { id: '3', to: 'marketing@airpak-express.site', subject: 'Weekly Newsletter - New Destinations', preview: 'Discover our new shipping destinations and exclusive offers for this week.', html: '', status: 'sent', category: 'marketing', sentAt: new Date(Date.now()-172800000).toISOString(), from: ZOHO_CONFIG.credentials.email, createdAt: new Date(Date.now()-172800000).toISOString(), openRate: 45, clickRate: 12 },
  { id: '4', to: 'support@example.com', subject: 'Support Request #12345', preview: 'Your support ticket has been received and our team is working on it.', html: '', status: 'delivered', category: 'support', sentAt: new Date(Date.now()-259200000).toISOString(), from: ZOHO_CONFIG.credentials.email, createdAt: new Date(Date.now()-259200000).toISOString(), deliveredAt: new Date(Date.now()-259100000).toISOString() },
  { id: '5', to: 'tracking@airpak-express.site', subject: 'Package Delivered - APK9876543210', preview: 'Great news! Your package has been successfully delivered to its destination.', html: '', status: 'opened', category: 'shipment', sentAt: new Date(Date.now()-604800000).toISOString(), from: ZOHO_CONFIG.credentials.email, createdAt: new Date(Date.now()-604800000).toISOString(), openedAt: new Date(Date.now()-432000000).toISOString(), openRate: 98 },
];

const EMAIL_TEMPLATES = [
  { id: 'shipment_created', name: 'Shipment Created', category: 'shipment' as EmailCategory, subject: 'Shipment Created - {{tracking}}', content: '<h1>Shipment Created!</h1><p>Dear Customer,</p><p>Your shipment <strong>{{tracking}}</strong> has been created successfully.</p><p>Track your package in real-time using our advanced tracking system.</p>' },
  { id: 'shipment_in_transit', name: 'In Transit Update', category: 'shipment' as EmailCategory, subject: 'Update: {{tracking}} In Transit', content: '<h1>Package Update</h1><p>Your shipment {{tracking}} is now in transit to its destination.</p><p>Current Location: {{location}}</p>' },
  { id: 'shipment_delivered', name: 'Delivered', category: 'shipment' as EmailCategory, subject: 'Delivered! - {{tracking}}', content: '<h1>Package Delivered!</h1><p>Great news! Your package {{tracking}} has been delivered.</p><p>We hope you enjoy your delivery!</p>' },
  { id: 'invoice_sent', name: 'Invoice', category: 'invoice' as EmailCategory, subject: 'Invoice {{number}} - Due {{date}}', content: '<h1>Invoice Ready</h1><p>Dear Customer,</p><p>Please find your invoice <strong>{{number}}</strong> attached.</p><p>Amount Due: {{amount}}</p><p>Due Date: {{date}}</p>' },
  { id: 'payment_received', name: 'Payment Confirmation', category: 'invoice' as EmailCategory, subject: 'Payment Received - {{amount}}', content: '<h1>Payment Confirmed</h1><p>We have received your payment of {{amount}}.</p><p>Transaction ID: {{transaction_id}}</p>' },
  { id: 'newsletter', name: 'Weekly Newsletter', category: 'marketing' as EmailCategory, subject: '{{week}} Newsletter - {{highlights}}', content: '<h1>Weekly Update</h1><p>Hello {{name}},</p><p>Here are this week\'s highlights:</p><ul>{{highlights}}</ul>' },
  { id: 'promo_offer', name: 'Promotional Offer', category: 'marketing' as EmailCategory, subject: 'Exclusive Offer - {{discount}}% Off!', content: '<h1>{{discount}}% OFF</h1><p>Use code: <strong>{{code}}</strong></p><p>Valid until: {{expiry}}</p>' },
  { id: 'support_response', name: 'Support Response', category: 'support' as EmailCategory, subject: 'Re: {{ticket_id}} - {{subject}}', content: '<h1>Support Ticket Update</h1><p>Hello,</p><p>Thank you for contacting us. {{response}}</p>' },
];

export const EmailAutomation: React.FC = () => {
  // Core state
  const [emails, setEmails] = useState<Email[]>(DEMO_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'scheduled' | 'drafts' | 'templates' | 'settings'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<EmailCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EmailStatus | 'all'>('all');

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [compose, setCompose] = useState({
    to: '',
    subject: '',
    content: '',
    category: 'notification' as EmailCategory,
    isHtml: true
  });
  const [schedule, setSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSending, setIsSending] = useState(false);

  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    provider: 'zoho',
    server: 'smtppro.zoho.com',
    port: 465,
    username: 'Admin@airpak-express.site',
    password: '',
    fromName: 'AirPak Express',
    fromEmail: 'Admin@airpak-express.site',
    useSSL: true
  });
  const [showSmtpForm, setShowSmtpForm] = useState(false);

  // Calculate stats
  const stats: EmailStats = useMemo(() => {
    const sent = emails.filter(e => e.sentAt).length;
    const delivered = emails.filter(e => e.status === 'delivered' || e.status === 'opened').length;
    const opened = emails.filter(e => e.status === 'opened').length;
    const clicked = emails.filter(e => (e.clickRate || 0) > 0).length;
    const bounced = emails.filter(e => e.status === 'bounced').length;
    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed: 0,
      deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
      openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
      clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0
    };
  }, [emails]);

  // Filter emails
  const filtered = useMemo(() => {
    let f = [...emails];

    // Filter by tab
    if (activeTab === 'sent') f = f.filter(e => e.sentAt);
    else if (activeTab === 'scheduled') f = f.filter(e => e.status === 'queued');
    else if (activeTab === 'drafts') f = f.filter(e => e.status === 'draft');
    else if (activeTab === 'inbox') f = f.filter(e => !e.sentAt);

    // Filter by search
    if (searchQuery) {
      f = f.filter(e =>
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      f = f.filter(e => e.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      f = f.filter(e => e.status === filterStatus);
    }

    return f.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [emails, activeTab, searchQuery, filterCategory, filterStatus]);

  const handleSend = async () => {
    if (!compose.to || !compose.subject) {
      toast.error('Please fill in required fields');
      return;
    }
    setIsSending(true);

    // Simulate sending
    await new Promise(r => setTimeout(r, 2000));

    const newEmail: Email = {
      id: Date.now().toString(),
      to: compose.to,
      subject: compose.subject,
      preview: compose.content.substring(0, 150),
      html: compose.content,
      status: schedule ? 'queued' : 'sent',
      category: compose.category,
      from: smtpSettings.fromEmail,
      sentAt: schedule ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setEmails(prev => [newEmail, ...prev]);
    toast.success(schedule ? 'Email scheduled successfully!' : 'Email sent successfully!');
    setIsSending(false);
    setShowCompose(false);
    setCompose({ to: '', subject: '', content: '', category: 'notification', isHtml: true });
    setSchedule(false);
    setScheduledAt('');
  };

  const handleSaveDraft = () => {
    const draft: Email = {
      id: Date.now().toString(),
      to: compose.to,
      subject: compose.subject,
      preview: compose.content.substring(0, 150),
      html: compose.content,
      status: 'draft',
      category: compose.category,
      from: smtpSettings.fromEmail,
      createdAt: new Date().toISOString()
    };
    setEmails(prev => [draft, ...prev]);
    toast.success('Draft saved');
    setShowCompose(false);
    setCompose({ to: '', subject: '', content: '', category: 'notification', isHtml: true });
  };

  const applyTemplate = (t: typeof EMAIL_TEMPLATES[0]) => {
    setCompose({
      ...compose,
      subject: t.subject,
      content: t.content,
      category: t.category
    });
    setShowTemplates(false);
    toast.success('Template applied successfully');
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
    toast.success('Email deleted');
  };

  const tabs = [
    { id: 'inbox' as const, label: 'Inbox', icon: Inbox, count: emails.filter(e => !e.sentAt).length },
    { id: 'sent' as const, label: 'Sent', icon: Send, count: emails.filter(e => e.sentAt).length },
    { id: 'scheduled' as const, label: 'Scheduled', icon: Clock, count: emails.filter(e => e.status === 'queued').length },
    { id: 'drafts' as const, label: 'Drafts', icon: FileText, count: emails.filter(e => e.status === 'draft').length },
    { id: 'templates' as const, label: 'Templates', icon: Archive, count: 0 },
    { id: 'settings' as const, label: 'SMTP Settings', icon: Settings, count: 0 },
  ];

  const statusColors: Record<EmailStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    queued: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    opened: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    bounced: 'bg-orange-100 text-orange-700'
  };

  const categoryColors: Record<EmailCategory, string> = {
    shipment: 'bg-blue-100 text-blue-700',
    invoice: 'bg-green-100 text-green-700',
    notification: 'bg-purple-100 text-purple-700',
    marketing: 'bg-pink-100 text-pink-700',
    system: 'bg-gray-100 text-gray-700',
    support: 'bg-cyan-100 text-cyan-700'
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Sidebar */}
      <div className="w-72 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b">
          <button
            onClick={() => { setShowCompose(true); setActiveTab('inbox'); }}
            className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30"
          >
            <Plus className="w-5 h-5" />
            Compose Email
          </button>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b bg-slate-50">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Zoho SMTP</span>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors ${
                activeTab === t.id
                  ? 'bg-red-50 text-red-600 border-r-4 border-red-500'
                  : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <t.icon className="w-5 h-5" />
                <span className="font-medium">{t.label}</span>
              </div>
              {t.count !== undefined && t.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === t.id ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-slate-800">{stats.sent}</p>
              <p className="text-xs text-slate-500">Sent</p>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</p>
              <p className="text-xs text-slate-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'settings' ? 'SMTP Settings' : activeTab}
            </h2>
            <p className="text-sm text-slate-500">
              {activeTab === 'settings' ? 'Configure your email provider' : `${filtered.length} emails`}
            </p>
          </div>

          {activeTab !== 'settings' && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-slate-300"
                />
              </div>

              {/* Filters */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as EmailCategory | 'all')}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="all">All Categories</option>
                <option value="shipment">Shipment</option>
                <option value="invoice">Invoice</option>
                <option value="notification">Notification</option>
                <option value="marketing">Marketing</option>
                <option value="support">Support</option>
              </select>

              <button
                onClick={() => setShowCompose(true)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'settings' ? (
            /* SMTP Settings Panel */
            <div className="p-6 max-w-2xl">
              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Provider</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'zoho', name: 'Zoho Mail', icon: Mail },
                      { id: 'sendgrid', name: 'SendGrid', icon: Send },
                      { id: 'ses', name: 'AWS SES', icon: Server },
                      { id: 'smtp', name: 'Custom SMTP', icon: Settings },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSmtpSettings(s => ({ ...s, provider: p.id as any }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          smtpSettings.provider === p.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p.icon className={`w-6 h-6 mx-auto mb-2 ${smtpSettings.provider === p.id ? 'text-red-500' : 'text-slate-400'}`} />
                        <p className="text-sm font-medium">{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SMTP Form */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Server className="w-5 h-5 text-slate-500" />
                    Server Configuration
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">SMTP Server</label>
                      <input
                        type="text"
                        value={smtpSettings.server}
                        onChange={e => setSmtpSettings(s => ({ ...s, server: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Port</label>
                      <input
                        type="number"
                        value={smtpSettings.port}
                        onChange={e => setSmtpSettings(s => ({ ...s, port: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                      <input
                        type="text"
                        value={smtpSettings.username}
                        onChange={e => setSmtpSettings(s => ({ ...s, username: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                      <input
                        type="password"
                        value={smtpSettings.password}
                        onChange={e => setSmtpSettings(s => ({ ...s, password: e.target.value }))}
                        placeholder="Enter password"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useSSL"
                      checked={smtpSettings.useSSL}
                      onChange={e => setSmtpSettings(s => ({ ...s, useSSL: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label htmlFor="useSSL" className="text-sm text-slate-600">Use SSL/TLS Encryption</label>
                  </div>
                </div>

                {/* From Settings */}
                <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-slate-500" />
                    Sender Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">From Name</label>
                      <input
                        type="text"
                        value={smtpSettings.fromName}
                        onChange={e => setSmtpSettings(s => ({ ...s, fromName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">From Email</label>
                      <input
                        type="email"
                        value={smtpSettings.fromEmail}
                        onChange={e => setSmtpSettings(s => ({ ...s, fromEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => { toast.success('SMTP settings saved!'); setShowSmtpForm(false); }}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Save SMTP Configuration
                </button>
              </div>
            </div>
          ) : activeTab === 'templates' ? (
            /* Templates Panel */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Email Templates</h3>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Template
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {EMAIL_TEMPLATES.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-red-300 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryColors[t.category]}`}>
                        {t.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">{t.name}</h4>
                    <p className="text-sm text-slate-500 mb-3 truncate">{t.subject}</p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setCompose({ to: '', subject: t.subject, content: t.content, category: t.category, isHtml: true }); setShowCompose(true); }}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Use Template
                      </button>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-slate-600 mb-1">No emails found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            /* Email List */
            <div className="divide-y divide-slate-100">
              {filtered.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmail(e)}
                  className={`w-full px-6 py-4 hover:bg-slate-50 text-left transition-colors ${
                    selectedEmail?.id === e.id ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-slate-800 truncate flex-1">{e.to}</span>
                    <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate mb-2">{e.subject}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[e.category]}`}>
                      {e.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[e.status]}`}>
                      {e.status}
                    </span>
                    {e.openRate && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="w-3 h-3" /> {e.openRate}%
                      </span>
                    )}
                    <button
                      onClick={(ev) => { ev.stopPropagation(); deleteEmail(e.id); }}
                      className="ml-auto p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail Panel */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-96 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 truncate pr-4">{selectedEmail.subject}</h3>
              <button onClick={() => setSelectedEmail(null)} className="p-1 hover:bg-slate-100 rounded">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 border-b space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{selectedEmail.to}</p>
                    <p className="text-xs text-slate-500">To</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[selectedEmail.status]}`}>
                  {selectedEmail.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Open Rate</p>
                  <p className="text-lg font-bold text-slate-800">{selectedEmail.openRate || 0}%</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Click Rate</p>
                  <p className="text-lg font-bold text-slate-800">{selectedEmail.clickRate || 0}%</p>
                </div>
              </div>

              {selectedEmail.sentAt && (
                <div className="text-xs text-slate-500">
                  Sent: {new Date(selectedEmail.sentAt).toLocaleString()}
                  {selectedEmail.openedAt && ` • Opened: ${new Date(selectedEmail.openedAt).toLocaleString()}`}
                </div>
              )}
            </div>

            <div className="p-5 flex-1">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Preview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedEmail.preview}</p>
            </div>

            <div className="p-4 border-t bg-slate-50 flex gap-2">
              <button className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors">
                <Edit3 className="w-4 h-4 inline mr-2" /> Edit
              </button>
              <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                <Send className="w-4 h-4 inline mr-2" /> Resend
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Mail className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Compose Email</h2>
                    <p className="text-sm text-slate-500">Create and send personalized emails</p>
                  </div>
                </div>
                <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                {/* Template Selection */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Use Template
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  {showTemplates && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-20 max-h-64 overflow-y-auto">
                      {EMAIL_TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => applyTemplate(t)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{t.name}</p>
                              <p className="text-xs text-slate-500">{t.subject}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[t.category]}`}>
                              {t.category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">To *</label>
                  <input
                    type="email"
                    value={compose.to}
                    onChange={e => setCompose({...compose, to: e.target.value})}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-slate-300"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={compose.subject}
                    onChange={e => setCompose({...compose, subject: e.target.value})}
                    placeholder="Enter subject line"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-slate-300"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {(['notification', 'shipment', 'invoice', 'marketing', 'support'] as EmailCategory[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCompose({...compose, category: cat})}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          compose.category === cat
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                  <textarea
                    value={compose.content}
                    onChange={e => setCompose({...compose, content: e.target.value})}
                    rows={8}
                    placeholder="Write your message here... (HTML supported)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-slate-300 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">HTML formatting is supported</p>
                </div>

                {/* Schedule */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule}
                      onChange={e => setSchedule(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700">Schedule for later</span>
                    </div>
                  </label>

                  {schedule && (
                    <div className="mt-4 ml-8">
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={e => setScheduledAt(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">
                <button
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
                >
                  Save as Draft
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending || !compose.to || !compose.subject}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-red-500/30"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {schedule ? 'Scheduling...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {schedule ? 'Schedule Email' : 'Send Email'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailAutomation;
