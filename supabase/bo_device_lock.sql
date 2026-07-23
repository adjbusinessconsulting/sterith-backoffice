-- Single active Back Office device per store (separate from the POS device lock,
-- so Premium = 1 POS + 1 Back Office). Back Office reads/writes these via Prisma
-- (direct connection), so no RLS policy is needed. Run once in the Supabase editor.
alter table public.stores add column if not exists active_bo_device_id text;
alter table public.stores add column if not exists active_bo_device_at timestamptz;
