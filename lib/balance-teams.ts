import type { Player } from "@/components/player-form"

export function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Mantém ordem por estrelas (maior primeiro), mas embaralha quem tem o mesmo número
 * de estrelas — assim cada sorteio pode gerar times diferentes sem perder o equilíbrio.
 */
export function orderPlayersBySkillWithShuffledTies(players: Player[]): Player[] {
  const bySkill = new Map<number, Player[]>()
  for (const p of players) {
    const s = p.skill
    if (!bySkill.has(s)) bySkill.set(s, [])
    bySkill.get(s)!.push(p)
  }
  const levels = Array.from(bySkill.keys()).sort((a, b) => b - a)
  const out: Player[] = []
  for (const level of levels) {
    out.push(...shuffleArray(bySkill.get(level)!))
  }
  return out
}

/**
 * Distribui jogadores em times com soma de habilidades o mais parecida possível.
 *
 * Heurística (como em apps de pelada “PRO”):
 * 1. Ordena por estrelas (maior primeiro), com ordem aleatória entre empates de estrelas.
 * 2. Cada jogador vai para o time que tem menos jogadores ainda; em empate,
 *    para o time com menor soma de estrelas até o momento.
 *
 * Isso equivale a um draft em “serpente” por rodada de habilidade, com desempate
 * por força total do time — boa aproximação para equilibrar somas.
 */
export function distributeBalancedTeams(
  players: Player[],
  caps: number[],
  initial: Player[][] = [],
): Player[][] {
  const numTeams = caps.length
  const sortedPlayers = orderPlayersBySkillWithShuffledTies(players)
  const newTeams: Player[][] = Array.from({ length: numTeams }, (_, i) => [
    ...(initial[i] ?? []),
  ])
  const teamSkills: number[] = newTeams.map((t) =>
    t.reduce((sum, p) => sum + p.skill, 0),
  )

  for (const player of sortedPlayers) {
    let minRoster = Infinity
    for (let i = 0; i < numTeams; i++) {
      if (newTeams[i].length < caps[i]) {
        minRoster = Math.min(minRoster, newTeams[i].length)
      }
    }

    let bestSum = Infinity
    const candidates: number[] = []
    for (let i = 0; i < numTeams; i++) {
      if (newTeams[i].length >= caps[i]) continue
      if (newTeams[i].length !== minRoster) continue
      const s = teamSkills[i]
      if (s < bestSum) {
        bestSum = s
        candidates.length = 0
        candidates.push(i)
      } else if (s === bestSum) {
        candidates.push(i)
      }
    }

    if (candidates.length === 0) break
    const targetTeamIndex =
      candidates[Math.floor(Math.random() * candidates.length)]

    newTeams[targetTeamIndex].push(player)
    teamSkills[targetTeamIndex] += player.skill
  }

  return newTeams
}

/**
 * Vagas por time. Sem goleiros: `playersPerTeam` para todos. Com goleiros, os primeiros
 * times têm goleiro próprio (ocupa a vaga) e os demais reaproveitam um que já está
 * jogando, então só preenchem `playersPerTeam - 1` vagas de linha.
 */
export function teamCaps(numTeams: number, playersPerTeam: number, gkCount: number): number[] {
  const owned = Math.min(gkCount, numTeams)
  return Array.from({ length: numTeams }, (_, i) =>
    gkCount === 0 || i < owned ? playersPerTeam : Math.max(0, playersPerTeam - 1),
  )
}

/** Sorteia com goleiros: um por time enquanto houver; times que sobram reaproveitam os que já jogam. */
export function drawWithGoalkeepers(
  ordered: Player[],
  numTeams: number,
  playersPerTeam: number,
): { teams: Player[][]; bench: Player[]; borrowed: (Player | null)[] } {
  const gks = ordered.filter((p) => p.goalkeeper)
  const owned = Math.min(gks.length, numTeams)
  const keepers = shuffleArray(gks.slice(0, owned))
  const caps = teamCaps(numTeams, playersPerTeam, gks.length)
  const keeperIds = new Set(keepers.map((k) => k.id))
  // goleiros excedentes jogam na linha
  const pool = ordered.filter((p) => !keeperIds.has(p.id))
  const fieldSlots = caps.reduce((a, b) => a + b, 0) - owned

  const teams = distributeBalancedTeams(
    pool.slice(0, fieldSlots),
    caps,
    keepers.map((k) => [k]),
  )
  const borrowed = teams.map((_, i) => (owned > 0 && i >= owned ? keepers[i % owned] : null))
  return { teams, bench: pool.slice(fieldSlots), borrowed }
}
