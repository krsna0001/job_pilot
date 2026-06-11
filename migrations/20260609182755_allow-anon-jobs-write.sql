-- Drop old policies on jobs table
DROP POLICY IF EXISTS "system can insert jobs" ON jobs;
DROP POLICY IF EXISTS "system can update jobs" ON jobs;

-- Create new policies allowing anon and authenticated users to insert/update jobs
CREATE POLICY "anyone can insert jobs" ON jobs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anyone can update jobs" ON jobs
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
