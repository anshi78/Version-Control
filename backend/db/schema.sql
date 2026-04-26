-- Supabase Schema Initialization for Website Version Control System

-- 1. Sites Table
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  owner_id TEXT NOT NULL, -- Clerk User ID
  current_version_id UUID, -- Will add foreign key later
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Versions Table
CREATE TABLE IF NOT EXISTS versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT NOT NULL, -- Clerk User ID
  manifest JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Add foreign key to sites for current_version_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_current_version'
        AND table_name = 'sites'
    ) THEN
        ALTER TABLE sites ADD CONSTRAINT fk_current_version
        FOREIGN KEY (current_version_id) REFERENCES versions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('UPLOAD', 'ROLLBACK')),
  user_id TEXT NOT NULL, -- Clerk user ID
  version_id UUID REFERENCES versions(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- 4. Locks Table
CREATE TABLE IF NOT EXISTS locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL UNIQUE REFERENCES sites(id) ON DELETE CASCADE,
  locked_by TEXT NOT NULL, -- Clerk user ID
  locked_at TIMESTAMPTZ DEFAULT NOW()
);
