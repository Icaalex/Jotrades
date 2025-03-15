/*
  # Add Referral System and Enhanced User Profiles

  1. Updates
    - Add referral_code to profiles table
    - Add referred_by to profiles table
    - Add referral_earnings to profiles table
    - Add referral_count to profiles table

  2. Security
    - Update RLS policies for new columns
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Update RLS policies
CREATE POLICY "Users can read their own referral data"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create function to handle referral rewards
CREATE OR REPLACE FUNCTION handle_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate 7% of deposit amount
  IF NEW.type = 'deposit' AND NEW.status = 'completed' THEN
    UPDATE profiles
    SET referral_earnings = referral_earnings + (NEW.amount * 0.07)
    FROM profiles AS referred_profile
    WHERE profiles.id = referred_profile.referred_by
    AND referred_profile.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral rewards
CREATE TRIGGER referral_reward_trigger
AFTER UPDATE ON transactions
FOR EACH ROW
WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
EXECUTE FUNCTION handle_referral_reward();