ALTER TABLE profiles 
ADD COLUMN email_alerts_enabled BOOLEAN DEFAULT false,
ADD COLUMN email_alerts_frequency TEXT DEFAULT 'daily' CHECK (email_alerts_frequency IN ('daily', 'weekly'));
