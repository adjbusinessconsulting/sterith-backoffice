-- Back Office product columns. The Prisma Product model declares these, but no
-- migration added them to the DB — so /api/products (findMany selects every model
-- column) crashed with a 500. All idempotent (IF NOT EXISTS): safe to re-run.

alter table public.products add column if not exists sku            text;
alter table public.products add column if not exists threshold      integer not null default 10;
alter table public.products add column if not exists warehouse_qty  integer not null default 0;
alter table public.products add column if not exists store_qty       integer not null default 0;
alter table public.products add column if not exists sold_today      integer not null default 0;
alter table public.products add column if not exists photo_url       text;
alter table public.products add column if not exists deleted_at      timestamptz;

-- Basic Inventori ledger (also in inventory_basic.sql; included so a fresh DB is complete).
alter table public.products add column if not exists stock_awal      integer not null default 0;
alter table public.products add column if not exists stock_tambahan  integer not null default 0;
alter table public.products add column if not exists stock_terjual   integer not null default 0;
alter table public.products add column if not exists stock_date      date;
