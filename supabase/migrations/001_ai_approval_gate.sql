-- Migration: 001_ai_approval_gate.sql
-- Create AI approval gate tables

CREATE TABLE IF NOT EXISTS public.ai_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    ai_confidence FLOAT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    before_state JSONB,
    after_state JSONB,
    ai_reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.ai_approvals ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all
CREATE POLICY "Admins can view all approvals"
    ON public.ai_approvals
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'super_admin'
    ));

-- Allow admins to update status
CREATE POLICY "Admins can update approval status"
    ON public.ai_approvals
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'super_admin'
    ));
