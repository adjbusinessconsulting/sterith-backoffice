// Where the POS lives, so Back Office can hand visitors to the shared demo.
//
// The Back Office demo used to be public/demo.html — a standalone copy that
// shared no code with either app and therefore drifted the moment anything
// changed. The POS demo already renders a Back Office view and has a Front/Back
// toggle, so pointing here gives one demo that is current by construction.
const isDev = process.env.VERCEL_ENV === "preview";

export const POS_BASE =
  (process.env.NEXT_PUBLIC_POS_BASE || "").trim() ||
  (isDev ? "https://pos-dev.sterith.com" : "https://pos.sterith.com");

/** The Back Office half of the shared demo. */
export const DEMO_URL = `${POS_BASE}/?demo=true&view=back`;
