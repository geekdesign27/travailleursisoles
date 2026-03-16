import { REGULATED_WORK_CATEGORIES } from "@/constants/regulatedWork";

export interface GateResult {
  blocked: boolean;
  zone: number | null;
  reason: string;
  reference: string;
}

/**
 * Evaluates Level 1 regulatory gate.
 * If any regulated work category is checked or the worker is a minor,
 * the analysis is blocked at Zone 1 (NO-GO).
 */
export function evaluateLevel1Gate(
  checkedCategories: string[],
  isMinor: boolean,
): GateResult {
  if (isMinor) {
    return {
      blocked: true,
      zone: 1,
      reason: "Travail isolé interdit pour le personnel mineur (< 18 ans)",
      reference: "OLT 4, art. 4 al. 1",
    };
  }

  if (checkedCategories.length > 0) {
    // Find the first matching category to provide a specific reference
    const firstId = checkedCategories[0];
    const category = REGULATED_WORK_CATEGORIES.find(
      (c) => String(c.id) === firstId,
    );

    const reason =
      checkedCategories.length === 1
        ? `Travail réglementé détecté : ${category?.label ?? "catégorie inconnue"}`
        : `${checkedCategories.length} travaux réglementés détectés`;

    const reference = category?.reference ?? "SUVA 44094.F";

    return {
      blocked: true,
      zone: 1,
      reason,
      reference,
    };
  }

  return {
    blocked: false,
    zone: null,
    reason: "",
    reference: "",
  };
}
