"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Search, AlertTriangle } from "lucide-react"
import { type Task, type TaskStatus, useTaskStore } from "@/lib/store"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
import { TaskDetails } from "@/components/task-details"
import { ColumnSkeleton } from "@/components/column-skeleton"
import { DndProvider, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { isTouchDevice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export default function KanbanTodoApp() {
  const { tasks, getTasksByStatus, searchTasks, deleteAllTasks, moveTask, checkOverdueTasks, setLoading, isLoading } =
    useTaskStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("new")
  const [searchQuery, setSearchQuery] = useState("")
  const [overdueTaskIds, setOverdueTaskIds] = useState<string[]>([])

  // Check for overdue tasks
  useEffect(() => {
    const checkTasks = () => {
      const overdueTasks = checkOverdueTasks()
      setOverdueTaskIds(overdueTasks)
    }

    // Check immediately and then every minute
    checkTasks()
    const interval = setInterval(checkTasks, 60000)

    return () => clearInterval(interval)
  }, [checkOverdueTasks])

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [setLoading])

  // Close context menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      // Context menus are handled within TaskCard component
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const handleCreateTask = (status: TaskStatus) => {
    setDefaultStatus(status)
    setEditingTask(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsCreateDialogOpen(true)
  }

  const handleViewTask = (task: Task) => {
    setViewingTask(task)
  }

  const getFilteredTasks = (status: TaskStatus) => {
    const statusTasks = getTasksByStatus(status)
    if (!searchQuery) return statusTasks

    return statusTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }


  const dismissOverdueAlert = (taskId: string) => {
    setOverdueTaskIds((prev) => prev.filter((id) => id !== taskId))
  }

  // Column component with drop functionality
  const Column = ({ status, title }: { status: TaskStatus; title: string }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "TASK",
      drop: (item: { id: string; status: TaskStatus }) => {
        if (item.status !== status) {
          moveTask(item.id, status)
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }))

    const columnTasks = getFilteredTasks(status)

    // Column colors based on status
    const getColumnColors = (status: TaskStatus) => {
      switch (status) {
        case "new":
          return "bg-blue-50 border-blue-200"
        case "ongoing":
          return "bg-orange-50 border-orange-200"
        case "done":
          return "bg-green-50 border-green-200"
        default:
          return "bg-gray-50 border-gray-200"
      }
    }

    const columnColors = getColumnColors(status)
    const borderColor = isOver ? "border-2 border-blue-400" : "border"

    // Use a callback ref to combine drop and React ref
    const divRef = (node: HTMLDivElement | null) => {
      drop(node)
    }

    return (
      <div ref={divRef} className="flex-1 min-h-[600px]">
        <Card className={`h-full ${columnColors} ${borderColor} transition-all duration-200`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {columnTasks?.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} onView={handleViewTask} />
            ))}

            {/* Add Card Button */}
            {
              title !== "Done" && title !== "Ongoing" && (
                <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-white/50 cursor-pointer"
              onClick={() => handleCreateTask(status)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a card
            </Button>
              )
            }
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine which backend to use based on device type
  const dndBackend = isTouchDevice() ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={dndBackend}>
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Image height={40} width={40} src="/todo.svg" alt="Todo Icon" className="object-cover" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">React Modern ToDo App</h1>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-64"
                  />
                </div>
                <Button onClick={() => handleCreateTask("new")} className="w-full md:w-auto cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Total tasks: {tasks.length} | New: {getTasksByStatus("new").length} | Ongoing:{" "}
              {getTasksByStatus("ongoing").length} | Done: {getTasksByStatus("done").length}
            </div>
            <div className="mt-8 text-center md:text-start text-sm text-gray-500">
            <p>💡 Tip: Drag and drop tasks between columns or right-click to move them</p>
          </div>

          </div>

          {/* Overdue Alerts */}
          {overdueTaskIds.length > 0 && (
            <div className="mb-6 space-y-2">
              {overdueTaskIds.map((taskId) => {
                const task = tasks.find((t) => t.id === taskId)
                if (!task) return null

                return (
                  <Alert key={taskId} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-red-800">
                        Task "{task.title}" is overdue! Due: {task.dueDate && new Date(task.dueDate).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissOverdueAlert(taskId)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        Dismiss
                      </Button>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          )}

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <ColumnSkeleton />
                <ColumnSkeleton />
                <ColumnSkeleton />
              </>
            ) : (
              <>
                <Column status="new" title="New" />
                <Column status="ongoing" title="Ongoing" />
                <Column status="done" title="Done" />
              </>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Modern React Todo App Created by <Link className="text-blue-600" href="mailto:riopulok@gmail.com">Pulok Chowdhury</Link></p>
          </div>

          {/* Modals */}
          <TaskForm
            isOpen={isCreateDialogOpen}
            onClose={() => {
              setIsCreateDialogOpen(false)
              setEditingTask(null)
            }}
            task={editingTask}
            defaultStatus={defaultStatus}
          />

          <TaskDetails
            isOpen={!!viewingTask}
            onClose={() => setViewingTask(null)}
            task={viewingTask}
            onEdit={(task) => {
              setViewingTask(null)
              handleEditTask(task)
            }}
          />
        </div>
      </div>
    </DndProvider>
  )
}
