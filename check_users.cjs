const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres.nyvgnbrnstfolaisdzmm:SgpjmGzgTZ4D6f28@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres' } }
});

async function main() {
  // Check auth users for anthonydjay@gmail.com
  const users = await db.$queryRawUnsafe(
    `SELECT id::text, email, created_at FROM auth.users WHERE email IN ('anthonydjay@gmail.com', 'sterith.id@sterith.com') ORDER BY created_at`
  );
  console.log('Auth users:', JSON.stringify(users, null, 2));

  // Check stores
  const stores = await db.$queryRawUnsafe(
    `SELECT id::text, name, owner_id::text FROM stores`
  );
  console.log('Stores:', JSON.stringify(stores, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
