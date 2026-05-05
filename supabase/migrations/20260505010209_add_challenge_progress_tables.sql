/*
  # Add Challenge Progress Tables

  1. New Tables
    - `challenge_progress`
      - `user_id` (text) - references user_profiles.user_id
      - `challenge_id` (text) - references challenge IDs
      - `solved` (boolean, default false)
      - `best_code` (text, nullable) - user's best solution code
      - `attempts` (integer, default 0)
      - `time_spent_seconds` (integer, default 0)
      - `solved_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, challenge_id)

  2. Security
    - Enable RLS on challenge_progress
    - Policies allow read/write for all (anonymous users via localStorage UUID)

  3. Notes
    - Tracks which challenges each user has solved
    - Stores best code for review
    - Tracks attempt count and time spent
*/

CREATE TABLE IF NOT EXISTS challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  challenge_id text NOT NULL,
  solved boolean DEFAULT false,
  best_code text,
  attempts integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  solved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own challenge progress"
  ON challenge_progress FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own challenge progress"
  ON challenge_progress FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own challenge progress"
  ON challenge_progress FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON challenge_progress(challenge_id);
