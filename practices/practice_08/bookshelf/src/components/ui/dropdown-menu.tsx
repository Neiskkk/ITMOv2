import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-40 min-w-52 rounded-xl border border-[#d7d1c4] bg-[#fffdf7] p-1.5 text-[#26372f] shadow-[0_14px_40px_rgba(20,37,31,0.16)] outline-none data-[state=closed]:animate-[fadeOut_.12s_ease-out] data-[state=open]:animate-[fadeIn_.14s_ease-out]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition select-none focus:bg-[#edf1e8] focus:text-forest data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  )
}
