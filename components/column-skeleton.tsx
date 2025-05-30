import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskCardSkeleton } from "@/components/task-card-skeleton"

export function ColumnSkeleton() {
  return (
    <Card className="bg-gray-50 border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}
