"use client";

import { Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Player } from "@/components/player-form";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  teamNumber: number;
  players: Player[];
  color: string;
}

const teamColors = [
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "from-red-500/20 to-red-500/5 border-red-500/30",
  "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  "from-orange-500/20 to-orange-500/5 border-orange-500/30",
];

const teamTextColors = [
  "text-emerald-400",
  "text-blue-400",
  "text-red-400",
  "text-amber-400",
  "text-purple-400",
  "text-pink-400",
  "text-cyan-400",
  "text-orange-400",
];

export function TeamCard({ teamNumber, players, color }: TeamCardProps) {
  const totalSkill = players.reduce((sum, p) => sum + p.skill, 0);
  const avgSkill = players.length > 0 ? totalSkill / players.length : 0;
  const colorIndex = (teamNumber - 1) % teamColors.length;

  return (
    <Card className={cn("bg-gradient-to-b border", teamColors[colorIndex])}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Descomente a linha abaixo para adicionar a logo do time */}
            {/* <img src="/logo-time.png" alt="Logo do Time" className="w-8 h-8 object-contain" /> */}
            <CardTitle className={cn("text-lg", teamTextColors[colorIndex])}>
              Time {teamNumber}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            <span>{players.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Força média:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 3 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < Math.round(avgSkill)
                    ? "fill-accent text-accent"
                    : "fill-transparent text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="ml-1">({totalSkill} pts)</span>
        </div>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum jogador
          </p>
        ) : (
          <ul className="space-y-1">
            {players.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between bg-background/50 rounded px-2 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-4">
                    {index + 1}.
                  </span>
                  {player.name}
                </span>
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
