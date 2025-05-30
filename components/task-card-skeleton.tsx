import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TaskCardSkeleton() {
  return (
    <Card className="p-4 mb-3 bg-gray-100 border-2 border-gray-200 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-3/4 bg-gray-300" />
          <Skeleton className="h-5 w-5 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-300" />
            <Skeleton className="h-4 w-4 rounded-full bg-gray-300" />
            <Skeleton className="h-4 w-16 bg-gray-300" />
          </div>
          <Skeleton className="h-4 w-12 bg-gray-300" />
        </div>

        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-4 w-12 bg-gray-300" />
          <Skeleton className="h-4 w-16 bg-gray-300" />
        </div>
      </div>
    </Card>
  )
}
