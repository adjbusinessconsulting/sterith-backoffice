export const ADDON_KEYS = ["inventori", "crm"] as const;
export type AddOnKey = (typeof ADDON_KEYS)[number];

export const ADDON_LABEL: Record<AddOnKey, string> = {
  inventori: "Inventori Lengkap",
  crm: "CRM + Loyalti",
};

export const hasAddOn = (addOns: string[] | undefined | null, key: AddOnKey): boolean =>
  Array.isArray(addOns) && addOns.includes(key);
