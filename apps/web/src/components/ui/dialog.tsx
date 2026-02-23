"use client"

import * as React from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
    </Sheet>
  )
}

export function DialogContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent side="center" className={`w-[450px] max-w-full ${className || ""}`} {...props}>
      {children}
    </SheetContent>
  )
}

export function DialogDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetDescription>) {
  return (
    <SheetDescription className={className} {...props}>
      {children}
    </SheetDescription>
  )
}

export function DialogFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetFooter>) {
  return (
    <SheetFooter className={className} {...props}>
      {children}
    </SheetFooter>
  )
}

export function DialogHeader({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetHeader>) {
  return (
    <SheetHeader className={className} {...props}>
      {children}
    </SheetHeader>
  )
}

export function DialogTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle className={className} {...props}>
      {children}
    </SheetTitle>
  )
}

export function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <SheetTrigger render={children} {...props} />
  }
  return <SheetTrigger render={<button {...props}>{children}</button>} />
}
