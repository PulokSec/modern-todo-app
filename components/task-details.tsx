"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, Tag, Edit, Trash2, AlertTriangle } from "lucide-react"
import { type Task, useTaskStore } from "@/lib/store"

interface TaskDetailsProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onEdit: (task: Task) => void
}

export function TaskDetails({ isOpen, onClose, task, onEdit }: TaskDetailsProps) {
  const { deleteTask } = useTaskStore()

  if (!task) return null

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
      onClose()
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-orange-100 text-orange-800"
      case "done":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = task.status === "ongoing" && task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <Badge className={getStatusColor(task.status)}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Priority:</span>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Task:</span>
              <Badge variant="outline">{task.taskNumber}</Badge>
            </div>
          </div>

          {/* Overdue Alert */}
          {isOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">This task is overdue!</p>
                <p className="text-red-600 text-sm">Due date was {new Date(task.dueDate!).toLocaleString()}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{task.description || "No description provided."}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Assignees:</span>
                <span className="text-sm text-gray-900">{task.assigneeCount}</span>
              </div>

              {task.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Estimated:</span>
                  <span className="text-sm text-gray-900">{task.estimatedHours}h</span>
                </div>
              )}

              {task.actualHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Actual:</span>
                  <span className="text-sm text-gray-900">{task.actualHours}h</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <span className="text-sm text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-gray-500"}`} />
                  <span className="text-sm font-medium text-gray-600">Due:</span>
                  <span className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}>
                    {new Date(task.dueDate).toLocaleString()}
                  </span>
                </div>
              )}

              {task.completedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Completed:</span>
                  <span className="text-sm text-gray-900">{new Date(task.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
            <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
