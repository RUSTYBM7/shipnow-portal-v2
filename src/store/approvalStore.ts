import { create } from 'zustand';
import { ApprovalQueueItem, ApprovalStatus } from '../features/approval/types';

interface ApprovalStore {
  queue: ApprovalQueueItem[];
  selectedItem: ApprovalQueueItem | null;
  setQueue: (items: ApprovalQueueItem[]) => void;
  setSelectedItem: (item: ApprovalQueueItem | null) => void;
  updateItemStatus: (id: string, status: ApprovalStatus, notes?: string) => void;
}

export const useApprovalStore = create<ApprovalStore>((set) => ({
  queue: [
    // Mock data for initial rendering
    {
      id: 'req-001',
      request_type: 'invoice',
      title: 'AI Auto-Generated Invoice for FedEx #4492',
      description: 'Detected missing invoice details. Automatically generated based on past shipments.',
      ai_generated_content: { total: '$450.00', items: ['Overnight Shipping', 'Handling Fee'] },
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
    },
    {
      id: 'req-002',
      request_type: 'email_campaign',
      title: 'Delay Notification to EU Customers',
      description: 'Drafted email apologizing for the weather-related delay in Frankfurt hub.',
      ai_generated_content: { subject: 'Update on your shipment', body: 'Dear customer, weather...' },
      status: 'pending',
      priority: 'normal',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    }
  ],
  selectedItem: null,
  setQueue: (queue) => set({ queue }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  updateItemStatus: (id, status, notes) =>
    set((state) => ({
      queue: state.queue.map(item =>
        item.id === id ? { ...item, status, review_notes: notes } : item
      ),
      selectedItem: state.selectedItem?.id === id
        ? { ...state.selectedItem, status, review_notes: notes }
        : state.selectedItem
    }))
}));
