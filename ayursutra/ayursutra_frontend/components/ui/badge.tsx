import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-ayur-green text-white": variant === "default",
          "border-transparent bg-ayur-sand text-ayur-text": variant === "secondary",
          "border-transparent bg-red-500 text-white": variant === "destructive",
          "border-transparent bg-green-500 text-white": variant === "success",
          "border-transparent bg-yellow-500 text-white": variant === "warning",
          "text-ayur-text border-ayur-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
