"use client";

import { Star, Trash2, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Player } from "@/components/player-form";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  players: Player[];
  selectedIds: string[];
  onRemovePlayer: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectionMode?: boolean;
}

export function PlayerList({
  players,
  selectedIds,
  onRemovePlayer,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  selectionMode = false,
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum jogador cadastrado ainda</p>
        <p className="text-sm">Adicione jogadores usando o formulario acima</p>
      </div>
    );
  }

  const allSelected = players.length > 0 && selectedIds.length === players.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < players.length;

  return (
    <div className="space-y-3">
      {selectionMode && (
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} de {players.length} selecionados
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              disabled={allSelected}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Selecionar Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              disabled={selectedIds.length === 0}
              className="text-xs"
            >
              Limpar Selecao
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {players.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <div
              key={player.id}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 group transition-all cursor-pointer",
                selectionMode && isSelected
                  ? "bg-primary/20 border border-primary"
                  : "bg-secondary border border-transparent",
                selectionMode && "hover:border-primary/50"
              )}
              onClick={() => selectionMode && onToggleSelect(player.id)}
            >
              <div className="flex items-center gap-3">
                {selectionMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(player.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                )}
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < player.skill
                            ? "fill-accent text-accent"
                            : "fill-transparent text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {!selectionMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(player.id);
                  }}
                  className="opacity-50 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
                  aria-label={`Remover ${player.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
