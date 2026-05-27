/**
 * AirPak Express - Shipments Page
 * List and manage all user shipments
 */

import React, { useState } from 'react';
import {
  Package, Search, Filter, ChevronRight, MapPin,
  Truck, CheckCircle, Clock, AlertTriangle, MoreVertical,
  Eye, Download, Copy, Plus
} from 'lucide-react';
import { useShipmentsStore } from '../../lib/shipmentsStore';
import toast from 'react-hot-toast';

interface ShipmentsPageProps {
  onNavigate?: (page: string) => void;
}

export const ShipmentsPage: React.FC<ShipmentsPageProps> = ({ onNavigate }) => {
  const { shipments, setCurrentShipment } = useShipmentsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    picked_up: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck },
    in_transit: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck },
    customs: { color: 'text-purple-600', bg: 'bg-purple-100', icon: AlertTriangle },
    out_for_delivery: { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Truck },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    exception: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
    returned: { color: 'text-gray-600', bg: 'bg-gray-100', icon: Package }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success('Tracking number copied!');
  };

  const handleViewDetails = (shipment: any) => {
    setCurrentShipment(shipment);
    onNavigate?.('tracking');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Shipments</h1>
          <p className="text-gray-400 mt-1">Track and manage all your shipments</p>
        </div>
        <button
          onClick={() => onNavigate?.('create')}
          className="px-4 py-2 bg-[#E31837] text-white rounded-xl font-medium hover:bg-[#B01030] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Shipment
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tracking number or destination..."
            className="w-full pl-10 pr-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#E31837]/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E31837]/50"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="exception">Exception</option>
        </select>
      </div>

      {/* Shipments List */}
      {filteredShipments.length === 0 ? (
        <div className="bg-[#1C1C1E] rounded-2xl p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No shipments found</h3>
          <p className="text-gray-400 mb-6">Create your first shipment to get started</p>
          <button
            onClick={() => onNavigate?.('create')}
            className="px-6 py-3 bg-[#E31837] text-white rounded-xl font-medium hover:bg-[#B01030] transition-colors"
          >
            Create Shipment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => {
            const config = statusConfig[shipment.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={shipment.id}
                className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                      <StatusIcon size={24} className={config.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{shipment.tracking_number}</h3>
                        <button
                          onClick={() => handleCopyTracking(shipment.tracking_number)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {shipment.origin?.city || 'Origin'} → {shipment.destination?.city || 'Destination'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                          {formatStatus(shipment.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(shipment)}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye size={18} className="text-gray-400" />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Picked up</span>
                    <span>In Transit</span>
                    <span>Out for Delivery</span>
                    <span>Delivered</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        shipment.status === 'delivered' ? 'bg-green-500' :
                        shipment.status === 'in_transit' ? 'bg-blue-500' :
                        shipment.status === 'out_for_delivery' ? 'bg-indigo-500' :
                        'bg-[#E31837]'
                      }`}
                      style={{
                        width: shipment.status === 'delivered' ? '100%' :
                              shipment.status === 'out_for_delivery' ? '75%' :
                              shipment.status === 'in_transit' ? '50%' :
                              shipment.status === 'picked_up' ? '25%' : '10%'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};