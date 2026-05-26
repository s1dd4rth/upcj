export const OWNER_ROLES = ["patient", "hospital", "tpa", "insurer", "regulator"] as const;
export type OwnerRole = (typeof OWNER_ROLES)[number];

export function ownerHue(role: OwnerRole): string {
  return `var(--owner-${role})`;
}

export function ownerLabelKey(role: OwnerRole): string {
  return `owners.${role}`;
}
