const TIER_LEVELS: Record<string, number> = { free: 0, standard: 1, premium: 2, business: 3, enterprise: 4 };
export const tierLevel = (tier: string) => TIER_LEVELS[tier?.toLowerCase()] ?? 0;
export const isAtLeast = (tier: string, required: string) => tierLevel(tier) >= tierLevel(required);
export const tierLabel = (tier: string) => tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
