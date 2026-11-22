import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border px-4 py-3 text-sm leading-6",
  {
    variants: {
      variant: {
        default: "border-[#c7d5c5] bg-[#edf3eb] text-[#234335]",
        destructive: "border-[#dfb8b1] bg-[#fbefec] text-[#7c2e27]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export function Alert({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}
