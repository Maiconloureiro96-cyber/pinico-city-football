/** Escala de habilidade alinhada a apps de sorteio (1–5 estrelas) */
export const SKILL_MIN = 1
export const SKILL_MAX = 5

export function normalizeSkill(skill: unknown): number {
  let s =
    typeof skill === "number" && !Number.isNaN(skill) ? Math.round(skill) : 3
  return Math.min(SKILL_MAX, Math.max(SKILL_MIN, s))
}

const LABELS: Record<number, string> = {
  1: "Muito fraco",
  2: "Fraco",
  3: "Medio",
  4: "Bom",
  5: "Muito bom",
}

export function skillLabel(skill: number): string {
  return LABELS[normalizeSkill(skill)] ?? "Medio"
}
