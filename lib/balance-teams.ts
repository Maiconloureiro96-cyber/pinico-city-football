import type { Player } from "@/components/player-form"

function shuffleArray<T>(arr: T[]): T[] {
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
  numTeams: number,
  playersPerTeam: number,
): Player[][] {
  const sortedPlayers = orderPlayersBySkillWithShuffledTies(players)
  const newTeams: Player[][] = Array.from({ length: numTeams }, () => [])
  const teamSkills: number[] = Array(numTeams).fill(0)

  for (const player of sortedPlayers) {
    let minRoster = Infinity
    for (let i = 0; i < numTeams; i++) {
      if (newTeams[i].length < playersPerTeam) {
        minRoster = Math.min(minRoster, newTeams[i].length)
      }
    }

    let bestSum = Infinity
    const candidates: number[] = []
    for (let i = 0; i < numTeams; i++) {
      if (newTeams[i].length >= playersPerTeam) continue
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

    const targetTeamIndex =
      candidates[Math.floor(Math.random() * candidates.length)] ?? 0

    newTeams[targetTeamIndex].push(player)
    teamSkills[targetTeamIndex] += player.skill
  }

  return newTeams
}
