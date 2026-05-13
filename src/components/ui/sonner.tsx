"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group toast group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:bg-background group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:transition-all group-[.toaster]:duration-300",
  {
    variants: {
      variant: {
        default: "group-[.toaster]:border-border group-[.toaster]:shadow-stone-200/50 dark:group-[.toaster]:shadow-none",
        success: "group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50/50 dark:group-[.toaster]:bg-green-500/5 group-[.toaster]:shadow-green-500/10",
        error: "group-[.toaster]:border-destructive/20 group-[.toaster]:bg-destructive/5 group-[.toaster]:shadow-destructive/10",
        warning: "group-[.toaster]:border-yellow-500/20 group-[.toaster]:bg-yellow-50/50 dark:group-[.toaster]:bg-yellow-500/5 group-[.toaster]:shadow-yellow-500/10",
        info: "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50/50 dark:group-[.toaster]:bg-blue-500/5 group-[.toaster]:shadow-blue-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: toastVariants(),
          title: "group-[.toast]:font-semibold group-[.toast]:text-[13px] group-[.toast]:leading-none tracking-tight",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:leading-normal",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:transition-all group-[.toast]:active:scale-95 group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:transition-all group-[.toast]:active:scale-95 group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:rounded-lg",
          success: toastVariants({ variant: "success" }),
          error: toastVariants({ variant: "error" }),
          warning: toastVariants({ variant: "warning" }),
          info: toastVariants({ variant: "info" }),
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600 dark:text-green-400" />,
        info: <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-600 dark:text-yellow-400" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      {...props}
    />
  )
}

export { Toaster }

