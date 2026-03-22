"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { SKILL_MAX } from "@/lib/player-skill"

interface SkillStarsProps {
  value: number
  className?: string
  starClassName?: string
}

/** Exibe 1–5 estrelas preenchidas conforme a habilidade do jogador */
export function SkillStars({ value, className, starClassName }: SkillStarsProps) {
  const v = Math.min(SKILL_MAX, Math.max(0, Math.round(value)))
  return (
    <div className={cn("flex gap-0.5", className)} aria-hidden>
      {Array.from({ length: SKILL_MAX }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i < v
              ? "fill-accent text-accent"
              : "fill-transparent text-muted-foreground",
            starClassName,
          )}
        />
      ))}
    </div>
  )
}
