CREATE TABLE IF NOT EXISTS alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_data JSONB NOT NULL,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  seen BOOLEAN DEFAULT false
);

ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY an_owner ON alert_notifications FOR ALL USING (auth.uid() = user_id);
