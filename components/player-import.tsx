"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Player } from "@/components/player-form"
import {
  dedupeNameList,
  normalizeNameKey,
  parsePlayerNamesFromPaste,
} from "@/lib/parse-player-import"

export interface ImportResult {
  added: Player[]
  skippedDuplicates: number
  skippedExisting: number
}

interface PlayerImportProps {
  existingPlayers: Player[]
  defaultSkill: number
  onImportMerge: (result: ImportResult) => void
  onImportReplace: (players: Player[]) => void
}

export function PlayerImport({
  existingPlayers,
  defaultSkill,
  onImportMerge,
  onImportReplace,
}: PlayerImportProps) {
  const [text, setText] = useState("")

  const maxListPriority = existingPlayers.reduce(
    (m, p) => Math.max(m, p.listPriority ?? -1),
    -1,
  )

  const runMerge = () => {
    const parsed = parsePlayerNamesFromPaste(text)
    const rawNames = dedupeNameList(parsed)
    const skippedDuplicates = Math.max(0, parsed.length - rawNames.length)
    const existingKeys = new Set(
      existingPlayers.map((p) => normalizeNameKey(p.name)),
    )
    const added: Player[] = []
    let skippedExisting = 0
    let nextP = maxListPriority + 1

    for (const name of rawNames) {
      const key = normalizeNameKey(name)
      if (existingKeys.has(key)) {
        skippedExisting++
        continue
      }
      added.push({
        id: crypto.randomUUID(),
        name,
        skill: defaultSkill,
        listPriority: nextP++,
      })
      existingKeys.add(key)
    }

    onImportMerge({
      added,
      skippedDuplicates,
      skippedExisting,
    })
    setText("")
  }

  const runReplace = () => {
    const parsed = parsePlayerNamesFromPaste(text)
    const rawNames = dedupeNameList(parsed)
    const players: Player[] = rawNames.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      skill: defaultSkill,
      listPriority: i,
    }))
    onImportReplace(players)
    setText("")
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileDown className="h-4 w-4" />
        Importar lista (WhatsApp)
      </div>
      <p className="text-xs text-muted-foreground">
        Pode colar a mensagem inteira do WhatsApp: títulos (Futebol, Chegar cedo,
        JOGADORES) e linhas só com número e traço sem nome são ignorados. Linhas no
        formato 01 - Nome viram jogadores; apelidos entre parênteses ficam no nome;
        vírgulas no fim são removidas. A ordem da lista define prioridade no banco.
      </p>
      <div className="space-y-2">
        <Label htmlFor="import-players" className="text-muted-foreground">
          Colar lista
        </Label>
        <Textarea
          id="import-players"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Futebol sexta as 21 hrs\n\nJOGADORES\n\n01 - Mariola\n02 - Sandro\n03 - Maicon`}
          rows={6}
          className="bg-background font-mono text-sm"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={!text.trim()}
          onClick={runMerge}
        >
          Importar e mesclar
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={!text.trim()}
            >
              Substituir tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Substituir todos os jogadores?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apaga o cadastro atual e importa apenas os nomes colados.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={runReplace}>Substituir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
