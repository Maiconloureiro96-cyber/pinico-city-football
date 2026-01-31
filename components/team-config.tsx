"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamConfigProps {
  numTeams: number;
  playersPerTeam: number;
  onNumTeamsChange: (value: number) => void;
  onPlayersPerTeamChange: (value: number) => void;
}

export function TeamConfig({
  numTeams,
  playersPerTeam,
  onNumTeamsChange,
  onPlayersPerTeamChange,
}: TeamConfigProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 bg-secondary rounded-lg p-4">
        <label className="text-sm text-muted-foreground mb-2 block">
          Quantidade de Times
        </label>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNumTeamsChange(Math.max(2, numTeams - 1))}
            disabled={numTeams <= 2}
            aria-label="Diminuir times"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-2xl font-bold tabular-nums">{numTeams}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNumTeamsChange(Math.min(8, numTeams + 1))}
            disabled={numTeams >= 8}
            aria-label="Aumentar times"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-secondary rounded-lg p-4">
        <label className="text-sm text-muted-foreground mb-2 block">
          Jogadores por Time
        </label>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPlayersPerTeamChange(Math.max(1, playersPerTeam - 1))}
            disabled={playersPerTeam <= 1}
            aria-label="Diminuir jogadores"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-2xl font-bold tabular-nums">{playersPerTeam}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPlayersPerTeamChange(Math.min(11, playersPerTeam + 1))}
            disabled={playersPerTeam >= 11}
            aria-label="Aumentar jogadores"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
