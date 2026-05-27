-- Messages table (for P2P chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type TEXT CHECK (sender_type IN ('user', 'ai', 'admin')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own ticket messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id
      AND (st.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes
CREATE INDEX idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- AI Approval Queue
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_approval_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT NOT NULL CHECK (request_type IN ('document', 'chat_response', 'analytics', 'label_generation')),
  title TEXT NOT NULL,
  ai_generated_content JSONB NOT NULL,
  human_edited_content JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE ai_approval_queue ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own queue items" ON ai_approval_queue
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage queue" ON ai_approval_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================================
-- User Notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'shipment_update', 'promotion')),
  title TEXT NOT NULL,
  body TEXT,
  deep_link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(read) WHERE read = FALSE;

-- ============================================================================
-- Crypto Payments (for Points system)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crypto_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points_purchased NUMERIC NOT NULL CHECK (points_purchased > 0),
  crypto_type TEXT NOT NULL CHECK (crypto_type IN ('BTC', 'ETH', 'USDT', 'USDC')),
  crypto_amount NUMERIC NOT NULL,
  network TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own payments" ON crypto_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage payments" ON crypto_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Indexes
CREATE INDEX idx_crypto_payments_user_id ON crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_status ON crypto_payments(status);

-- ============================================================================
-- Function: Add read receipt
-- ============================================================================
CREATE OR REPLACE FUNCTION add_read_receipt(p_message_id UUID, p_user_id UUID)
RETURNS messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET read_by = array_append(read_by, p_user_id)
  WHERE id = p_message_id
  AND NOT (p_user_id = ANY(read_by));

  RETURN (SELECT * FROM messages WHERE id = p_message_id);
END;
$$;