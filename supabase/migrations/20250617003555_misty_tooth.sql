/*
  # Initial Schema for QR Code Generator

  1. New Tables
    - `qr_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `short_url` (text, unique)
      - `original_url` (text)
      - `scans` (integer, default 0)
      - `last_scanned` (timestamp)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `analytics`
      - `id` (uuid, primary key)
      - `qr_code_id` (uuid, references qr_codes)
      - `scanned_at` (timestamp)
      - `user_agent` (text)
      - `ip_address` (text)
      - `country` (text)
      - `city` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access to their own data
*/

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  short_url text UNIQUE NOT NULL,
  original_url text NOT NULL,
  scans integer DEFAULT 0,
  last_scanned timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE NOT NULL,
  scanned_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text,
  country text,
  city text
);

-- Enable Row Level Security
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for qr_codes table
CREATE POLICY "Users can view their own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes"
  ON qr_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for analytics table
CREATE POLICY "Users can view analytics for their QR codes"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes 
      WHERE qr_codes.id = analytics.qr_code_id 
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics (for tracking scans)"
  ON analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_url ON qr_codes(short_url);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_qr_code_id ON analytics(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_analytics_scanned_at ON analytics(scanned_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- This migration adds a `type` column to the qr_codes table
-- to store the kind of QR code (e.g., 'url', 'text', 'vcard').
-- The `DEFAULT 'url'` ensures that any existing QR codes in your
-- database are safely handled and considered URLs.

ALTER TABLE public.qr_codes
ADD COLUMN type TEXT NOT NULL DEFAULT 'url';