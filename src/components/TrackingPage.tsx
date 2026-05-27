/**
 * AirPak Express - Tracking Page
 * Track shipments with interactive map and timeline
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin, Truck, Package, CheckCircle, Clock, AlertTriangle,
  Phone, MessageCircle, Search, ChevronRight, Share2, Copy
} from 'lucide-react';
import { useShipmentsStore } from '../lib/shipmentsStore';
import SupportChat from './SupportChat';
import toast from 'react-hot-toast';

export const TrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { shipments, currentShipment, setCurrentShipment } = useShipmentsStore();
  const [trackingInput, setTrackingInput] = useState(searchParams.get('id') || '');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && shipments.length > 0) {
      const shipment = shipments.find(s => s.id === id);
      if (shipment) setCurrentShipment(shipment);
    }
  }, [searchParams, shipments, setCurrentShipment]);

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const statusSteps = [
    { status: 'Order Created', key: 'pending' },
    { status: 'Picked Up', key: 'picked_up' },
    { status: 'In Transit', key: 'in_transit' },
    { status: 'Customs', key: 'customs', optional: true },
    { status: 'Out for Delivery', key: 'out_for_delivery' },
    { status: 'Delivered', key: 'delivered' }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['pending', 'picked_up', 'in_transit', 'customs', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const handleCopyTracking = () => {
    if (currentShipment?.tracking_number) {
      navigator.clipboard.writeText(currentShipment.tracking_number);
      toast.success('Tracking number copied!');
    }
  };

  const handleShare = () => {
    if (navigator.share && currentShipment?.tracking_number) {
      navigator.share({
        title: 'Track my AirPak shipment',
        text: `Track shipment ${currentShipment.tracking_number} at ${window.location.origin}/tracking?id=${currentShipment.id}`,
      });
    }
  };

  if (!currentShipment) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Track Shipment</h1>
          <p className="text-gray-400 mt-1">Enter your tracking number or select from recent shipments</p>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Enter tracking number (e.g., APK20240525001234)"
              className="w-full pl-12 pr-4 py-4 bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#E31837]/50"
            />
          </div>
          <button className="px-6 py-4 bg-[#E31837] text-white rounded-xl font-medium hover:bg-[#B01030] transition-colors">
            Track
          </button>
        </div>

        {/* Recent Shipments */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Shipments</h3>
          {shipments.length === 0 ? (
            <div className="bg-[#1C1C1E] rounded-2xl p-8 text-center">
              <Package size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No recent shipments to track</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {shipments.slice(0, 5).map((shipment) => (
                <button
                  key={shipment.id}
                  onClick={() => setCurrentShipment(shipment)}
                  className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Truck size={24} className="text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{shipment.tracking_number}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {shipment.origin?.city} → {shipment.destination?.city}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const shipment = currentShipment;
  const stepStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-[#E31837] text-white animate-pulse';
      default:
        return 'bg-white/10 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{shipment.tracking_number}</h1>
            <button onClick={handleCopyTracking} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Copy size={18} className="text-gray-400" />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Share2 size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              shipment.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
              shipment.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {formatStatus(shipment.status)}
            </span>
            <span className="text-sm text-gray-400">
              Estimated delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-6">Shipment Progress</h3>
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" />
          <div
            className="absolute top-6 left-0 h-0.5 bg-[#E31837]"
            style={{
              width: shipment.status === 'delivered' ? '100%' :
                    shipment.status === 'out_for_delivery' ? '80%' :
                    shipment.status === 'in_transit' ? '50%' :
                    shipment.status === 'picked_up' ? '25%' : '10%'
            }}
          />

          {/* Steps */}
          {statusSteps.map((step, index) => {
            const status = getStepStatus(step.key, shipment.status);
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stepStatusClass(status)}`}>
                  {status === 'completed' ? (
                    <CheckCircle size={24} />
                  ) : status === 'current' ? (
                    <Truck size={24} />
                  ) : (
                    <Clock size={24} />
                  )}
                </div>
                <p className={`text-xs mt-2 text-center ${status === 'current' ? 'text-white font-medium' : 'text-gray-500'}`}>
                  {step.status}
                </p>
                {step.optional && (
                  <span className="text-[10px] text-gray-600">(optional)</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Route Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Origin & Destination */}
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Route</h3>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E31837]/10 text-[#E31837] rounded-xl hover:bg-[#E31837]/20 transition-colors"
              >
                <MessageCircle size={18} />
                Get Help
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Origin */}
              <div className="flex-1">
                <p className="text-sm text-gray-400">From</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {shipment.origin?.city || 'Origin'}
                </p>
                <p className="text-sm text-gray-500">
                  {shipment.origin?.country || ''}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#E31837] rounded-full flex items-center justify-center">
                  <Truck size={24} className="text-white" />
                </div>
                <div className="w-0.5 h-8 bg-white/10" />
              </div>

              {/* Destination */}
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-400">To</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {shipment.destination?.city || 'Destination'}
                </p>
                <p className="text-sm text-gray-500">
                  {shipment.destination?.country || ''}
                </p>
              </div>
            </div>

            {/* Package Details */}
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Weight</p>
                <p className="text-sm font-medium text-white mt-1">{shipment.weight || '0'} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Service</p>
                <p className="text-sm font-medium text-white mt-1 capitalize">{shipment.service || 'Standard'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Created</p>
                <p className="text-sm font-medium text-white mt-1">
                  {new Date(shipment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Support */}
          {showChat && (
            <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Support Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <SupportChat isFloating={false} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Package size={20} className="text-gray-400" />
                <span className="text-sm text-white">Create Similar Shipment</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <AlertTriangle size={20} className="text-gray-400" />
                <span className="text-sm text-white">Report an Issue</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Phone size={20} className="text-gray-400" />
                <span className="text-sm text-white">Contact Support</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <div className="space-y-3">
              {shipment.status === 'in_transit' && (
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-blue-400">Your package is on the way!</p>
                  <p className="text-xs text-gray-400 mt-1">Expected in 2-3 days</p>
                </div>
              )}
              {shipment.status === 'out_for_delivery' && (
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm text-green-400">Out for delivery today!</p>
                  <p className="text-xs text-gray-400 mt-1">Between 9AM - 6PM</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;