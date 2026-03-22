import type { Player } from "@/components/player-form"

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Ordem para preencher vagas em campo vs banco: quem tem `listPriority` (lista importada)
 * entra na ordem do topo da lista; jogadores sem prioridade entram depois, em ordem aleatória.
 */
export function orderPlayersForSlotAllocation(players: Player[]): Player[] {
  const withP = players.filter(
    (p) => p.listPriority !== undefined && p.listPriority !== null,
  )
  const withoutP = players.filter(
    (p) => p.listPriority === undefined || p.listPriority === null,
  )

  const sortedP = [...withP].sort((a, b) => a.listPriority! - b.listPriority!)
  const shuffledRest = shuffle(withoutP)
  return [...sortedP, ...shuffledRest]
}
