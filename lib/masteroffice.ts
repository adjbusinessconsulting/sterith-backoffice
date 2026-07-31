// Master Office base URL. It issues/verifies credentials against a specific
// Supabase project, so it MUST match the database this deployment talks to.
// Dev/Preview sets NEXT_PUBLIC_MO_BASE to the dev Master Office; unset
// (production) falls back to the live one.
export const MO_BASE =
  process.env.NEXT_PUBLIC_MO_BASE || "https://masteroffice.sterith.com";
