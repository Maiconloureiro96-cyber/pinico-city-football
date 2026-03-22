import type { Player } from "@/components/player-form"

/**
 * Distribui jogadores em times com soma de habilidades o mais parecida possível.
 *
 * Heurística (como em apps de pelada “PRO”):
 * 1. Ordena por estrelas (maior primeiro).
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
  const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill)
  const newTeams: Player[][] = Array.from({ length: numTeams }, () => [])
  const teamSkills: number[] = Array(numTeams).fill(0)

  for (const player of sortedPlayers) {
    let targetTeamIndex = 0
    let minSkill = Infinity
    let minPlayers = Infinity

    for (let i = 0; i < numTeams; i++) {
      if (newTeams[i].length < playersPerTeam) {
        if (
          newTeams[i].length < minPlayers ||
          (newTeams[i].length === minPlayers && teamSkills[i] < minSkill)
        ) {
          minPlayers = newTeams[i].length
          minSkill = teamSkills[i]
          targetTeamIndex = i
        }
      }
    }

    newTeams[targetTeamIndex].push(player)
    teamSkills[targetTeamIndex] += player.skill
  }

  return newTeams
}
