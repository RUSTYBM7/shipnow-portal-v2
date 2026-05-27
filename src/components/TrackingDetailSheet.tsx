/**
 * Wales HQ Global Logistics - Tracking Detail Sheet
 * iOS-style bottom sheet with tracking timeline and actions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Printer, Share2, Navigation, MapPin, Clock, CheckCircle,
  Truck, Package, ChevronUp, ChevronDown, QrCode, X, ExternalLink
} from 'lucide-react';
import { useShipmentStore } from '../store';
import { printTrackingLabel, generateQRCode } from '../utils/print';

interface TrackingDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const TrackingDetailSheet: React.FC<TrackingDetailSheetProps> = ({
  isOpen,
  onClose,
  onShare,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { selectedShipment } = useShipmentStore();

  if (!selectedShipment) return null;

  const {
    tracking_number,
    status,
    origin,
    destination,
    estimated_delivery,
    events = [],
  } = selectedShipment;

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    picked_up: { label: 'Picked Up', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    in_transit: { label: 'In Transit', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    customs: { label: 'Customs Processing', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100' },
    exception: { label: 'Exception', color: 'text-red-600', bgColor: 'bg-red-100' },
    returned: { label: 'Returned', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  const handlePrintLabel = async () => {
    await printTrackingLabel(selectedShipment);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tracking/${tracking_number}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track Your Package',
          text: `Track shipment ${tracking_number} with Wales HQ`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        onShare?.();
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      onShare?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div
              onClick={() => setExpanded(e => !e)}
              className="flex justify-center py-3 cursor-pointer"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-5 pb-6 overflow-y-auto max-h-[calc(85vh-60px)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="text-lg font-bold text-gray-900">{tracking_number}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${currentStatus.bgColor} ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{origin.city}</p>
                  <p className="text-xs text-gray-400">{origin.country}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{destination.city}</p>
                  <p className="text-xs text-gray-400">{destination.country}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Est. Delivery</p>
                  <p className="text-sm font-semibold text-[#DC143C]">
                    {new Date(estimated_delivery).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => {
                    setExpanded(true);
                    toast.success('Tracking history expanded');
                  }}
                  className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#B01030] transition-colors"
                >
                  <Navigation size={16} />
                  View Details
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <Printer size={18} />
                </button>
              </div>

              {/* Expandable Timeline */}
              <div>
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <h4 className="font-semibold text-gray-900">Tracking History</h4>
                  {expanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {[...events].reverse().map((event, i) => (
                          <div key={event.id || i} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  event.completed ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              />
                              {i < events.length - 1 && (
                                <div
                                  className={`w-0.5 h-10 mt-0.5 ${
                                    event.completed ? 'bg-blue-200' : 'bg-gray-200'
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{event.status}</p>
                              <p className="text-xs text-gray-500">
                                {event.location} • {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {event.completed && (
                              <CheckCircle size={14} className="text-blue-500 mt-0.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* QR Code Modal */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
                    onClick={() => setShowQR(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      className="bg-white rounded-2xl p-6 m-4 max-w-xs w-full"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Share Tracking</h3>
                        <button onClick={() => setShowQR(false)}>
                          <X size={20} className="text-gray-400" />
                        </button>
                      </div>
                      <div className="flex justify-center mb-4">
                        <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                          <QrCode size={120} className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-500">
                        Scan to track your shipment
                      </p>
                      <button
                        onClick={handlePrintLabel}
                        className="w-full mt-4 py-3 bg-[#DC143C] text-white rounded-xl font-medium hover:bg-[#B01030] transition-colors"
                      >
                        Print Label
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrackingDetailSheet;
