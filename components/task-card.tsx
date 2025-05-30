"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Edit, MoreHorizontal, Trash2, Copy, Eye, Clock, AlertTriangle } from "lucide-react"
import { type Task, type TaskStatus, useTaskStore } from "@/lib/store"
import { useDrag } from "react-dnd"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onView: (task: Task) => void
}

export function TaskCard({ task, onEdit, onView }: TaskCardProps) {
  const { deleteTask, duplicateTask, moveTask } = useTaskStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
    }
  }

  const handleDuplicate = () => {
    duplicateTask(task.id)
  }

  const handleMove = (newStatus: TaskStatus) => {
    moveTask(task.id, newStatus)
    setContextMenu(null)
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const getAvailableStatuses = (currentStatus: TaskStatus): { status: TaskStatus; label: string }[] => {
    const allStatuses = [
      { status: "new" as TaskStatus, label: "New" },
      { status: "ongoing" as TaskStatus, label: "Ongoing" },
      { status: "done" as TaskStatus, label: "Done" },
    ]
    return allStatuses.filter((s) => s.status !== currentStatus)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColors = (status: TaskStatus) => {
    switch (status) {
      case "new":
        return {
          background: "bg-blue-100 border-blue-200",
          text: "text-blue-900",
          iconText: "text-blue-700",
        }
      case "ongoing":
        return {
          background: "bg-orange-100 border-orange-200",
          text: "text-orange-900",
          iconText: "text-orange-700",
        }
      case "done":
        return {
          background: "bg-green-100 border-green-200",
          text: "text-green-900",
          iconText: "text-green-700",
        }
      default:
        return {
          background: "bg-white border-gray-200",
          text: "text-gray-900",
          iconText: "text-gray-700",
        }
    }
  }

  const statusColors = getStatusColors(task.status)

  return (
    <>
      <Card
        ref={drag}
        className={`p-4 mb-3 shadow-sm transition-all border-2 group ${
          statusColors.background
        } ${isDragging ? "opacity-50 cursor-grabbing" : "opacity-100 cursor-pointer hover:cursor-grab"} ${
          task.isOverdue ? "border-l-4 border-l-red-500" : ""
        } hover:shadow-md hover:scale-[1.02]`}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onContextMenu={handleRightClick}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3
              className={`font-medium text-sm leading-tight cursor-pointer hover:underline ${statusColors.text}`}
              onClick={() => onView(task)}
            >
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50 ${statusColors.iconText} cursor-pointer`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(task)} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {getAvailableStatuses(task.status).map(({ status, label }) => (
                  <DropdownMenuItem key={status} onClick={() => handleMove(status)} className="cursor-pointer">
                    Move to {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center ${statusColors.iconText}`}>
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">{task.assigneeCount}</span>
              </div>
              <Edit className={`h-4 w-4 ${statusColors.iconText}`} />
              <Badge variant="outline" className={`text-xs border-current ${statusColors.text}`}>
                {task.taskNumber}
              </Badge>
            </div>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
          </div>

          {task.status === "ongoing" && task.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className={`h-3 w-3 ${task.isOverdue ? "text-red-500" : statusColors.iconText}`} />
              <span className={task.isOverdue ? "text-red-500 font-medium" : statusColors.iconText}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
              {task.isOverdue && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
            </div>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className={`text-xs ${statusColors.text} bg-white/50`}>
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className={`text-xs ${statusColors.text} bg-white/50`}>
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Custom Right-Click Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop to close menu */}
          <div className="fixed inset-0 z-40" onClick={handleCloseContextMenu} />

          {/* Context Menu */}
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: "translate(-50%, 0)", // Center horizontally on cursor
            }}
          >
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">Move to:</div>
            {getAvailableStatuses(task.status).map(({ status, label }) => (
              <button
                key={status}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleMove(status)}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  onView(task)
                  setContextMenu(null)
                }}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                View Details
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  onEdit(task)
                  setContextMenu(null)
                }}
              >
                <Edit className="h-4 w-4 mr-2 inline" />
                Edit Task
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
