/**
 * Extrai nomes de um texto colado (lista do WhatsApp).
 *
 * Suporta o modelo comum do grupo, por exemplo:
 * - Título / avisos ("Futebol sexta...", "Chegar cedo...", "JOGADORES") — ignorados
 * - Linhas numeradas: "01 - Mariola", "05 - Léo (irmão do Erick)", "10 - boka,"
 * - Vagas vazias: "13 - ", "14 -" — ignoradas
 * - Lista simples (um nome por linha), bullets e "1. Nome" — mantido para compatibilidade
 */

/** Linhas de título / aviso que não são jogadores */
function isSectionHeaderLine(line: string): boolean {
  const t = line.trim()
  if (!t) return false

  if (/^jogadores\b/iu.test(t)) return true
  if (/^futebol\b/iu.test(t)) return true
  if (/^chegar\s+cedo\b/iu.test(t)) return true
  if (/^pelada\b/iu.test(t)) return true
  if (/^hor[aá]rio\b/iu.test(t)) return true
  if (/^lista\b/iu.test(t)) return true

  return false
}

/** Remove vírgulas/pontos finais espúrios e normaliza espaços */
function cleanImportedName(raw: string): string {
  let s = raw.trim()
  s = s.replace(/[,;]+$/g, '')
  s = s.trim()
  s = s.replace(/\s+/g, ' ')
  return s.trim()
}

/**
 * "01 - Mariola", "10 -   boka,  " → nome limpo; slot vazio → string vazia
 */
function tryParseNumberedDashLine(line: string): string | null {
  const m = line.match(/^\s*\d+\s*[-–—.:]\s*(.*)$/u)
  if (!m) return null
  const name = cleanImportedName(m[1] ?? '')
  return name
}

export function parsePlayerNamesFromPaste(raw: string): string[] {
  const lines = raw.split(/\r?\n/)
  const names: string[] = []

  for (const line of lines) {
    const t = line.replace(/\uFEFF/g, '').trim()
    if (!t) continue

    if (isSectionHeaderLine(t)) continue

    const numberedName = tryParseNumberedDashLine(t)
    if (numberedName !== null) {
      if (numberedName) names.push(numberedName)
      continue
    }

    // "12) Nome" ou "12. Nome" (sem traço)
    const mParen = t.match(/^\s*\d+[\.\)]\s+(.+)$/u)
    if (mParen) {
      const name = cleanImportedName(mParen[1] ?? '')
      if (name) names.push(name)
      continue
    }

    // Lista simples / bullets (compatibilidade)
    let s = t
    s = s.replace(/^[\s]*[-*•✓✔☑]+\s*/u, '')
    s = s.replace(/^\d+[\.\)]\s+/, '')
    s = s.trim()
    if (!s) continue

    names.push(s)
  }

  return names
}

/** Remove duplicatas na própria lista (preserva ordem, comparação sem acento/case). */
export function dedupeNameList(names: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const n of names) {
    const key = normalizeNameKey(n)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(n)
  }
  return out
}

export function normalizeNameKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
