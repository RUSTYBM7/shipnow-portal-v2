export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'blocked' | 'modified' | 'escalated';
export type RequestType = 'document' | 'invoice' | 'email_campaign' | 'workflow' | 'graphic' | 'pricing' | 'route' | 'shipment';

export interface ApprovalQueueItem {
  id: string;
  request_type: RequestType;
  title: string;
  description?: string;
  ai_generated_content: any;
  human_edited_content?: any;
  status: ApprovalStatus;
  priority: 'low' | 'normal' | 'high' | 'critical';
  created_at: string;
  reviewed_by?: string;
  review_notes?: string;
}
