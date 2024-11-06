'use client'

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Current progress value between 0 and 100 */
  value?: number
  /** Optional indicator of whether the progress is in an error state */
  hasError?: boolean
  /** Optional indicator text to be announced to screen readers */
  indicator?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className = "", value = 0, hasError, indicator, ...props }, ref) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))
  
  // Determine background color based on error state
  const bgClasses = hasError ? "bg-red-200" : "bg-surface-secondary"
  const indicatorClasses = `h-full w-full flex-1 transition-all ${hasError ? "bg-red-500" : "bg-hero"}`

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={`relative h-4 w-full overflow-hidden rounded-full ${bgClasses} ${className}`.trim()}
      {...props}
      aria-label={indicator || `Progress: ${clampedValue}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
    >
      <ProgressPrimitive.Indicator
        className={indicatorClasses}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
      {/* Optional visually hidden text for screen readers */}
      <span className="sr-only">{clampedValue}% complete</span>
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = "Progress"

export { Progress }