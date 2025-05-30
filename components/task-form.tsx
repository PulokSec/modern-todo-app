"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { type Task, type TaskPriority, type TaskStatus, useTaskStore } from "@/lib/store"

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task | null
  defaultStatus?: TaskStatus
}

export function TaskForm({ isOpen, onClose, task, defaultStatus = "new" }: TaskFormProps) {
  const { createTask, updateTask } = useTaskStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: defaultStatus,
    priority: "medium" as TaskPriority,
    assigneeCount: 1,
    taskNumber: "",
    dueDate: "",
    estimatedHours: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeCount: task.assigneeCount,
        taskNumber: task.taskNumber,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
        estimatedHours: task.estimatedHours?.toString() || "",
        tags: task.tags,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        status: defaultStatus,
        priority: "medium",
        assigneeCount: 1,
        taskNumber: `#${Date.now().toString().slice(-4)}`,
        dueDate: "",
        estimatedHours: "",
        tags: [],
      })
    }
  }, [task, defaultStatus, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const taskData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assigneeCount: formData.assigneeCount,
      taskNumber: formData.taskNumber,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours ? Number.parseInt(formData.estimatedHours) : undefined,
      tags: formData.tags,
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      createTask(taskData)
    }

    onClose()
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  // Show due date field only for ongoing tasks
  const showDueDate = formData.status === "ongoing"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigneeCount">Assignee Count</Label>
              <Input
                id="assigneeCount"
                type="number"
                min="1"
                value={formData.assigneeCount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, assigneeCount: Number.parseInt(e.target.value) || 1 }))
                }
              />
            </div>

            <div>
              <Label htmlFor="taskNumber">Task Number</Label>
              <Input
                id="taskNumber"
                value={formData.taskNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, taskNumber: e.target.value }))}
                placeholder="#123"
              />
            </div>

            {showDueDate && (
              <div className="col-span-2">
                <Label htmlFor="dueDate" className="font-medium">
                  Due Date (Required for Ongoing tasks)
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required={formData.status === "ongoing"}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a deadline for this task. Tasks will be marked as overdue if they pass this date.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedHours: e.target.value }))}
                placeholder="8"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || (formData.status === "ongoing" && !formData.dueDate)}
            >
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
