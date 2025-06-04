import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const infoBoxVariants = cva(
  "p-4 rounded-lg border text-sm leading-relaxed",
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-muted-foreground",
        accent: "bg-primary/10 border-primary/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InfoBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof infoBoxVariants> {
  title?: string
  children: React.ReactNode
}

const InfoBox = React.forwardRef<HTMLDivElement, InfoBoxProps>(
  ({ className, variant, title, children, ...props }, ref) => {
    return (
      <div
        className={cn(infoBoxVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {title && (
          <span className="font-medium block mb-1">
            {title}
          </span>
        )}
        <div>{children}</div>
      </div>
    )
  }
)
InfoBox.displayName = "InfoBox"

export { InfoBox, infoBoxVariants } 