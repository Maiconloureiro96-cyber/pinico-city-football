"use client"

import { useState } from "react"
import { FileDown, ListChecks, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { StarRating } from "@/components/star-rating"
import type { Player } from "@/components/player-form"
import {
  dedupeNameList,
  normalizeNameKey,
  parsePlayerNamesFromPaste,
} from "@/lib/parse-player-import"
import { normalizeSkill, skillLabel } from "@/lib/player-skill"

export interface ImportResult {
  added: Player[]
  skippedDuplicates: number
  skippedExisting: number
}

type PreviewRow = {
  name: string
  skill: number
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
  const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null)

  const maxListPriority = existingPlayers.reduce(
    (m, p) => Math.max(m, p.listPriority ?? -1),
    -1,
  )

  const parsedNames = (): { rawNames: string[]; skippedDuplicates: number } => {
    const parsed = parsePlayerNamesFromPaste(text)
    const rawNames = dedupeNameList(parsed)
    const skippedDuplicates = Math.max(0, parsed.length - rawNames.length)
    return { rawNames, skippedDuplicates }
  }

  const analyzeList = () => {
    const { rawNames } = parsedNames()
    if (rawNames.length === 0) {
      setPreviewRows([])
      return
    }
    const initial = normalizeSkill(defaultSkill)
    setPreviewRows(
      rawNames.map((name) => ({
        name,
        skill: initial,
      })),
    )
  }

  const clearPreview = () => {
    setPreviewRows(null)
  }

  const updateRowSkill = (index: number, skill: number) => {
    setPreviewRows((prev) => {
      if (!prev) return prev
      const next = [...prev]
      next[index] = { ...next[index], skill: normalizeSkill(skill) }
      return next
    })
  }

  const setAllSkills = (skill: number) => {
    const s = normalizeSkill(skill)
    setPreviewRows((prev) => prev?.map((r) => ({ ...r, skill: s })) ?? null)
  }

  const handleTextChange = (value: string) => {
    setText(value)
    setPreviewRows(null)
  }

  const hasPreviewList = previewRows !== null && previewRows.length > 0

  const runMerge = () => {
    if (!previewRows?.length) return

    const existingKeys = new Set(
      existingPlayers.map((p) => normalizeNameKey(p.name)),
    )
    const added: Player[] = []
    let skippedExisting = 0
    let nextP = maxListPriority + 1

    for (const row of previewRows) {
      const key = normalizeNameKey(row.name)
      if (existingKeys.has(key)) {
        skippedExisting++
        continue
      }
      added.push({
        id: crypto.randomUUID(),
        name: row.name,
        skill: normalizeSkill(row.skill),
        listPriority: nextP++,
      })
      existingKeys.add(key)
    }

    const { skippedDuplicates } = parsedNames()

    onImportMerge({
      added,
      skippedDuplicates,
      skippedExisting,
    })
    setText("")
    setPreviewRows(null)
  }

  const runReplace = () => {
    if (!previewRows?.length) return

    const players: Player[] = previewRows.map((row, i) => ({
      id: crypto.randomUUID(),
      name: row.name,
      skill: normalizeSkill(row.skill),
      listPriority: i,
    }))
    onImportReplace(players)
    setText("")
    setPreviewRows(null)
  }

  const canImport = hasPreviewList

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileDown className="h-4 w-4" />
        Importar lista (WhatsApp)
      </div>
      <p className="text-xs text-muted-foreground">
        Cole a mensagem do grupo; depois use{" "}
        <span className="text-foreground font-medium">Analisar lista</span> para ver os
        nomes e definir a habilidade (estrelas) de cada um antes de importar. A ordem da
        lista continua valendo para prioridade no banco.
      </p>
      <div className="space-y-2">
        <Label htmlFor="import-players" className="text-muted-foreground">
          Colar lista
        </Label>
        <Textarea
          id="import-players"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={`Futebol sexta as 21 hrs\n\nJOGADORES\n\n01 - Mariola\n02 - Sandro\n03 - Maicon`}
          rows={6}
          className="bg-background font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!text.trim()}
          onClick={analyzeList}
          className="gap-1.5"
        >
          <ListChecks className="h-4 w-4" />
          Analisar lista
        </Button>
        {hasPreviewList && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            className="gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar classificação
          </Button>
        )}
      </div>

      {hasPreviewList && (
        <div className="space-y-3 rounded-md border border-border bg-background/80 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              Classifique cada jogador ({previewRows.length} na lista)
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Todos:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 min-w-8 px-2 text-xs"
                  onClick={() => setAllSkills(n)}
                >
                  {n}★
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-[min(320px,50vh)] pr-3">
            <ul className="space-y-3">
              {previewRows.map((row, index) => (
                <li
                  key={`${row.name}-${index}`}
                  className="flex flex-col gap-2 rounded-lg border border-border/80 bg-secondary/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium leading-snug">{row.name}</span>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <StarRating
                      value={row.skill}
                      onChange={(v) => updateRowSkill(index, v)}
                      max={5}
                    />
                    <span className="text-xs text-muted-foreground min-w-[5.5rem]">
                      {skillLabel(row.skill)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}

      {previewRows !== null && previewRows.length === 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Nenhum nome encontrado. Ajuste o texto e analise de novo.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={!canImport}
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
              disabled={!canImport}
            >
              Substituir tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Substituir todos os jogadores?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apaga o cadastro atual e importa a lista classificada (habilidades
                por estrela que você definiu). Esta ação não pode ser desfeita.
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
