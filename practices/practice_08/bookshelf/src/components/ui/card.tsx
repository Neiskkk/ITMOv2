import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-[#d9d4c7] bg-[#fcfaf4] text-[#202923]",
        className,
      )}
      {...props}
    />
  )
}
