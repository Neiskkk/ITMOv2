import type { InputHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function Input({
  className,
  type,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-xl border border-[#c7c2b4] bg-[#fffdf7] px-3.5 text-base text-[#202923] outline-none transition placeholder:text-[#8b8a82] hover:border-[#999e92] focus-visible:border-[#245644] focus-visible:ring-3 focus-visible:ring-[#c0d2bd]/70 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-[#a33c32] aria-invalid:ring-3 aria-invalid:ring-[#e9c7c0]/65",
        className,
      )}
      {...props}
    />
  )
}
