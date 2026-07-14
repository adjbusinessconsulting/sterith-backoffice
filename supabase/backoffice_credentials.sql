-- ============================================================
-- Optional separate Back Office password (email stays shared with POS).
-- backoffice_password_hash = bcrypt; NULL means "same password as POS".
-- owner_email is stamped when a separate password is set, so the login can
-- find the owner by email without a Supabase round-trip. Idempotent.
-- Run once: Supabase -> SQL Editor.
-- ============================================================
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS backoffice_password_hash text;
