"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";
import { skillLabel } from "@/lib/player-skill";
import { Plus } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  skill: number;
  /** Ordem na lista importada (menor = entra antes quando há banco). Opcional. */
  listPriority?: number;
}

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
}

export function PlayerForm({ onAddPlayer }: PlayerFormProps) {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddPlayer({
      id: crypto.randomUUID(),
      name: name.trim(),
      skill,
    });

    setName("");
    setSkill(3);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full">
        <label htmlFor="player-name" className="text-sm text-muted-foreground mb-1 block">
          Nome do Jogador
        </label>
        <Input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome..."
          className="bg-secondary border-border"
        />
      </div>
      <div className="w-full sm:w-auto">
        <label className="text-sm text-muted-foreground mb-1 block">
          Habilidade (1 a 5 estrelas)
        </label>
        <div className="flex items-center gap-2 h-9 flex-wrap">
          <StarRating value={skill} onChange={setSkill} max={5} />
          <span className="text-xs text-muted-foreground min-w-[5.5rem]">
            {skillLabel(skill)}
          </span>
        </div>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-1" />
        Adicionar
      </Button>
    </form>
  );
}
