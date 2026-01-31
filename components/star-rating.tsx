"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 3 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              star <= value
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
