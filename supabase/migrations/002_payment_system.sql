-- Migration: 002_payment_system.sql
-- Create payment system tables

CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    wallet_id UUID NOT NULL REFERENCES public.user_wallets(id),
    type VARCHAR(50) NOT NULL, -- 'purchase', 'spend', 'bonus', 'adjustment', 'crypto_deposit'
    amount NUMERIC(10, 2) NOT NULL,
    points_change INTEGER NOT NULL,
    points_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    crypto_currency VARCHAR(20),
    crypto_amount NUMERIC(18, 8),
    tx_hash VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
    ON public.user_wallets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);
