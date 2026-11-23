import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-[#c0d2bd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3e9] disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        default:
          "bg-forest text-white shadow-[0_7px_20px_rgba(24,63,50,0.18)] hover:bg-[#245644]",
        outline:
          "border border-[#c7c2b4] bg-transparent text-forest hover:border-forest hover:bg-[#edf1e8]",
        ghost: "text-[#476057] hover:bg-[#edf1e8] hover:text-forest",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
