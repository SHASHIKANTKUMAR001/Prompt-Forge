
-- Table to track user credits, linked to Clerk user IDs
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Public read (users query their own credits by clerk_user_id in app code)
CREATE POLICY "Users can read their own credits"
ON public.user_credits
FOR SELECT
USING (true);

-- Allow inserts (for new user registration)
CREATE POLICY "Allow insert credits"
ON public.user_credits
FOR INSERT
WITH CHECK (true);

-- Allow updates (for credit deduction/addition)
CREATE POLICY "Allow update credits"
ON public.user_credits
FOR UPDATE
USING (true);

-- Transaction log for credit changes
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'signup_bonus'
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own transactions"
ON public.credit_transactions
FOR SELECT
USING (true);

CREATE POLICY "Allow insert transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
