import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "warning"
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const isWarning = variant === "warning"

  return (
    <Card className={cn(
      "overflow-hidden border-border/50 shadow-sm",
      isWarning && "border-secondary/50",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-3xl font-semibold tracking-tight",
              isWarning ? "text-secondary" : "text-foreground"
            )}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-primary" : "text-destructive"
                )}
              >
                {trend.positive ? "+" : "-"}
                {Math.abs(trend.value)}% em relação ao mês anterior
              </p>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            isWarning ? "bg-secondary/10" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              isWarning ? "text-secondary" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}