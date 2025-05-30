import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TaskStatus = "new" | "ongoing" | "done"

export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeCount: number
  taskNumber: string
  createdAt: Date
  updatedAt: Date
  movedToOngoingAt?: Date
  completedAt?: Date
  dueDate?: Date
  tags: string[]
  estimatedHours?: number
  actualHours?: number
  isOverdue?: boolean
}

interface TaskStore {
  tasks: Task[]
  isLoading: boolean

  // CRUD Operations
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined

  // Status Management
  moveTask: (id: string, newStatus: TaskStatus) => void
  checkOverdueTasks: () => string[]
  updateTaskOverdueStatus: (id: string) => void

  // Filtering and Sorting
  getTasksByStatus: (status: TaskStatus) => Task[]
  searchTasks: (query: string) => Task[]

  // Loading State
  setLoading: (isLoading: boolean) => void

  // Bulk Operations
  deleteAllTasks: () => void
  duplicateTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: "1",
          title: "Admin Panel Test Cases",
          description:
            "Comprehensive testing of admin panel functionality including user management, settings, and reporting features.",
          status: "new",
          priority: "high",
          assigneeCount: 1,
          taskNumber: "#3",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          tags: ["testing", "admin", "high-priority"],
          estimatedHours: 8,
        },
        {
          id: "2",
          title: "Seller Panel Test Cases",
          description: "Testing seller dashboard, product management, order processing, and analytics features.",
          status: "new",
          priority: "medium",
          assigneeCount: 1,
          taskNumber: "#40",
          createdAt: new Date("2024-01-16"),
          updatedAt: new Date("2024-01-16"),
          tags: ["testing", "seller", "dashboard"],
          estimatedHours: 6,
        },
        {
          id: "3",
          title: "Sales Manager Panel",
          description: "Testing sales management features, team performance tracking, and commission calculations.",
          status: "new",
          priority: "medium",
          assigneeCount: 1,
          taskNumber: "#41",
          createdAt: new Date("2024-01-17"),
          updatedAt: new Date("2024-01-17"),
          tags: ["testing", "sales", "management"],
          estimatedHours: 5,
        },
        {
          id: "4",
          title: "Customer Support & Operations",
          description: "Testing customer support tools, ticket management, and operational workflows.",
          status: "new",
          priority: "high",
          assigneeCount: 1,
          taskNumber: "#43",
          createdAt: new Date("2024-01-18"),
          updatedAt: new Date("2024-01-18"),
          tags: ["testing", "support", "operations"],
          estimatedHours: 7,
        },
        {
          id: "5",
          title: "Shop Panel Test Cases",
          description: "Testing e-commerce functionality, product catalog, shopping cart, and checkout process.",
          status: "new",
          priority: "low",
          assigneeCount: 1,
          taskNumber: "#13",
          createdAt: new Date("2024-01-19"),
          updatedAt: new Date("2024-01-19"),
          tags: ["testing", "shop", "ecommerce"],
          estimatedHours: 4,
        },
        {
          id: "6",
          title: "Questions",
          description: "Address pending questions and clarifications from the development team.",
          status: "ongoing",
          priority: "medium",
          assigneeCount: 2,
          taskNumber: "#1115",
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20"),
          movedToOngoingAt: new Date("2024-01-21"),
          dueDate: new Date("2024-02-01"),
          tags: ["questions", "clarification"],
          estimatedHours: 2,
        },
      ],
      isLoading: false,

      setLoading: (isLoading) => set({ isLoading }),

      createTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          tasks: [newTask, ...state.tasks.filter((task) => task.status === "new")].concat(
            state.tasks.filter((task) => task.status !== "new"),
          ),
        }))
      },

      updateTask: (id, updates) => {
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === id) {
              const updatedTask = { ...task, ...updates, updatedAt: new Date() }

              // Check if due date was updated and reset overdue status if needed
              if (updates.dueDate) {
                const now = new Date()
                const newDueDate = new Date(updates.dueDate)

                // If the new due date is in the future, reset overdue status
                if (newDueDate > now) {
                  updatedTask.isOverdue = false
                } else {
                  updatedTask.isOverdue = true
                }
              }

              // If status is changed from ongoing, reset overdue status
              if (updates.status && updates.status !== "ongoing") {
                updatedTask.isOverdue = false
              }

              return updatedTask
            }
            return task
          })

          return { tasks: updatedTasks }
        })
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      getTask: (id) => {
        return get().tasks.find((task) => task.id === id)
      },

      moveTask: (id, newStatus) => {
        const now = new Date()
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === id) {
              const updates: Partial<Task> = {
                status: newStatus,
                updatedAt: now,
              }

              // Add timestamp when moved to ongoing
              if (newStatus === "ongoing") {
                updates.movedToOngoingAt = now
              }

              // Add completion timestamp when moved to done
              if (newStatus === "done") {
                updates.completedAt = now
                updates.isOverdue = false // Reset overdue when completed
              }

              // Reset overdue status when moved away from ongoing
              if (newStatus !== "ongoing") {
                updates.isOverdue = false
              }

              return { ...task, ...updates }
            }
            return task
          })

          // Sort tasks based on their status and timestamps
          return {
            tasks: updatedTasks.sort((a, b) => {
              // New tasks at the top of New column (newest first)
              if (a.status === "new" && b.status === "new") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              }

              // Ongoing tasks ordered by when they were moved
              if (a.status === "ongoing" && b.status === "ongoing") {
                const aTime = a.movedToOngoingAt ? new Date(a.movedToOngoingAt).getTime() : 0
                const bTime = b.movedToOngoingAt ? new Date(b.movedToOngoingAt).getTime() : 0
                return bTime - aTime
              }

              // Done tasks ordered by completion time
              if (a.status === "done" && b.status === "done") {
                const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
                const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
                return bTime - aTime
              }

              return 0
            }),
          }
        })
      },

      updateTaskOverdueStatus: (id) => {
        const task = get().getTask(id)
        if (task && task.status === "ongoing" && task.dueDate) {
          const now = new Date()
          const isOverdue = new Date(task.dueDate) < now

          if (task.isOverdue !== isOverdue) {
            get().updateTask(id, { isOverdue })
          }
        }
      },

      checkOverdueTasks: () => {
        const now = new Date()
        const overdueTasks = get()
          .tasks.filter((task) => {
            if (task.status === "ongoing" && task.dueDate) {
              const isOverdue = new Date(task.dueDate) < now

              // Update the task's overdue status if it has changed
              if (task.isOverdue !== isOverdue) {
                get().updateTask(task.id, { isOverdue })
              }

              return isOverdue
            }
            return false
          })
          .map((task) => task.id)

        return overdueTasks
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status)
      },

      searchTasks: (query) => {
        const lowercaseQuery = query.toLowerCase()
        return get().tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description.toLowerCase().includes(lowercaseQuery) ||
            task.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
        )
      },

      deleteAllTasks: () => {
        set({ tasks: [] })
      },

      duplicateTask: (id) => {
        const task = get().getTask(id)
        if (task) {
          const duplicatedTask: Task = {
            ...task,
            id: Date.now().toString(),
            title: `${task.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: undefined,
            isOverdue: false, // Reset overdue status for duplicated task
          }
          set((state) => ({
            tasks: [duplicatedTask, ...state.tasks],
          }))
        }
      },
    }),
    {
      name: "kanban-tasks",
    },
  ),
)
