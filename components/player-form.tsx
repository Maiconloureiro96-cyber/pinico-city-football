"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";
import { Plus } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  skill: number;
}

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
}

export function PlayerForm({ onAddPlayer }: PlayerFormProps) {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddPlayer({
      id: crypto.randomUUID(),
      name: name.trim(),
      skill,
    });

    setName("");
    setSkill(2);
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
          Habilidade
        </label>
        <div className="flex items-center gap-2 h-9">
          <StarRating value={skill} onChange={setSkill} />
          <span className="text-xs text-muted-foreground min-w-16">
            {skill === 1 ? "Ruim" : skill === 2 ? "Medio" : "Bom"}
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
