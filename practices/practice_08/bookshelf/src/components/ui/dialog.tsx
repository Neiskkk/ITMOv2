import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#14251f]/45 backdrop-blur-[2px] data-[state=closed]:animate-[fadeOut_.16s_ease-out] data-[state=open]:animate-[fadeIn_.18s_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-6 overflow-y-auto rounded-[1.6rem] border border-[#d9d4c7] bg-[#fdfbf5] p-5 shadow-[0_24px_70px_rgba(20,37,31,0.22)] outline-none data-[state=closed]:animate-[dialogOut_.16s_ease-out] data-[state=open]:animate-[dialogIn_.2s_ease-out] sm:p-7",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-[#52625b] outline-none transition hover:bg-[#edf1e8] hover:text-forest focus-visible:ring-3 focus-visible:ring-[#c0d2bd]">
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Закрыть</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("space-y-2 pr-10", className)} {...props} />
  )
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-serif text-3xl text-forest", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-6 text-[#69736e]", className)}
      {...props}
    />
  )
}
