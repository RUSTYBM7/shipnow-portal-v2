/**
 * Wales HQ Global Logistics - Sidebar Configuration
 * Navigation items with roles and badges
 */

import {
  LayoutDashboard, MapPin, Package, MessageCircle, Settings,
  Shield, Users, Ticket, Bot, BarChart3, PlusCircle, Gift,
  Headphones, FileText, CreditCard, HelpCircle, ChevronLeft
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  roles: ('user' | 'admin')[];
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
  external?: boolean;
}

export const sidebarItems: SidebarItem[] = [
  // User items
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['user', 'admin'],
  },
  {
    id: 'create',
    label: 'New Shipment',
    icon: PlusCircle,
    path: '/create',
    roles: ['user', 'admin'],
    highlight: true,
  },
  {
    id: 'tracking',
    label: 'Track Shipment',
    icon: MapPin,
    path: '/tracking',
    roles: ['user', 'admin'],
  },
  {
    id: 'shipments',
    label: 'My Shipments',
    icon: Package,
    path: '/shipments',
    roles: ['user', 'admin'],
  },
  {
    id: 'support',
    label: 'Support',
    icon: Headphones,
    path: '/support',
    roles: ['user', 'admin'],
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: Gift,
    path: '/rewards',
    roles: ['user', 'admin'],
    badge: 'New',
    badgeColor: 'bg-[#DC143C] text-white',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['user', 'admin'],
  },

  // Admin items
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Shield,
    path: '/admin',
    roles: ['admin'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: Ticket,
    path: '/admin/tickets',
    roles: ['admin'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics',
    roles: ['admin'],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Bot,
    path: '/admin/automation',
    roles: ['admin'],
  },
];

// Wales HQ branding
export const WALES_HQ_BRAND = {
  name: 'Wales HQ',
  tagline: 'ShipNow',
  logo: Package,
  colors: {
    primary: '#DC143C',
    secondary: '#B01030',
  },
};

// Get items filtered by role
export const getItemsByRole = (role: 'user' | 'admin') => {
  return sidebarItems.filter(item => item.roles.includes(role));
};

// Mobile nav tabs
export const mobileNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'create', icon: PlusCircle, label: 'Ship' },
  { id: 'shipments', icon: Package, label: 'Orders' },
  { id: 'tracking', icon: MapPin, label: 'Track' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default sidebarItems;
