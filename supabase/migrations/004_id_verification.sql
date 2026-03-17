-- supabase/migrations/004_id_verification.sql

-- 1. Add is_admin to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create verification status enum
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS public.id_verification_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       verification_status NOT NULL DEFAULT 'pending',
  total_points INTEGER NOT NULL CHECK (total_points BETWEEN 0 AND 500),
  documents    JSONB NOT NULL DEFAULT '[]',
  photo_urls   JSONB NOT NULL DEFAULT '[]',
  admin_note   TEXT,
  reviewed_by  UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Unique index: only one pending/approved per user
CREATE UNIQUE INDEX IF NOT EXISTS one_active_submission_per_user
  ON public.id_verification_submissions (user_id)
  WHERE status IN ('pending', 'approved');

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION public.update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS id_verification_updated_at ON public.id_verification_submissions;
CREATE TRIGGER id_verification_updated_at
  BEFORE UPDATE ON public.id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_verification_updated_at();

-- 6. RLS
ALTER TABLE public.id_verification_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON public.id_verification_submissions;
CREATE POLICY "Users can view own submissions"
  ON public.id_verification_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own submissions" ON public.id_verification_submissions;
CREATE POLICY "Users can insert own submissions"
  ON public.id_verification_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can do everything" ON public.id_verification_submissions;
CREATE POLICY "Admins can do everything"
  ON public.id_verification_submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 7. Trigger: sync sitters.id_verified on status change
CREATE OR REPLACE FUNCTION public.sync_id_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = OLD.status) THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'approved' THEN
    UPDATE public.sitters SET id_verified = TRUE WHERE user_id = NEW.user_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.sitters SET id_verified = FALSE WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_verification_status_change ON public.id_verification_submissions;
CREATE TRIGGER on_verification_status_change
  AFTER INSERT OR UPDATE OF status ON public.id_verification_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_id_verified();
