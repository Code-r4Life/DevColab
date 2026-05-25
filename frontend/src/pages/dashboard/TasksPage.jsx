import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Badge, Button } from "../../components/ui";
import { cn } from "../../assets/utils";
import { Clock, CheckCircle2, Circle, AlertCircle, ArrowRight, Eye } from "lucide-react";
import { useWorkspace } from "../../context/useWorkspace";
import api, { unwrap } from "../../lib/api";
import { formatDate } from "../../lib/format";

// Separated Sub-component first to ensure no initialization hoisting breaks
const TaskCard = ({ task }) => {
  if (!task) return null;

  // Safe validation check to find the raw string ID
  const pId = task.projectId?._id || (typeof task.projectId === "string" ? task.projectId : null);
  
  return (
    <div className="surface p-4 rounded-xl space-y-3 hover:border-gray-700 transition-all group bg-white/5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 mt-1.5",
          task.priority === "P0" ? "bg-danger" : task.priority === "P1" ? "bg-warning" : "bg-info"
        )} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-dark-border/40 text-[11px]">
        <span className="text-gray-500 flex items-center gap-1">
          <Clock size={12} /> {formatDate(task.dueDate)}
        </span>
        {pId && (
          <Link 
            to={`/project/${pId}/board`} 
            className="text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
          >
            Go to board <ArrowRight size={10} />
          </Link>
        )}
      </div>
    </div>
  );
};

const TasksPage = () => {
  const { currentWorkspace, projects } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      if (!currentWorkspace) return;
      
      try {
        setLoading(true);
        const wsId = currentWorkspace._id || currentWorkspace.id;
        const res = unwrap(await api.get(`/tasks/workspace/${wsId}/me`));
        setTasks(res.tasks || []);
      } catch (err) {
        console.error("failed to fetch user tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [currentWorkspace, projects]);

  // status filtering matching backend keys exactly
  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const inReviewTasks = tasks.filter(t => t.status === "in_review");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <PageShell breadcrumbs={["Dashboard", "My Tasks"]}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Tasks</h1>
          <p className="text-gray-500">Track and manage all your assignments across this workspace.</p>
        </div>

        {loading ? (
          <div className="surface p-12 rounded-xl text-center text-gray-400">Loading your tasks...</div>
        // Find this block in TasksPage.jsx and update it:
        ) : tasks.length === 0 ? (
          <div className="surface p-12 rounded-xl text-center space-y-3">
           <p className="text-gray-400">No tasks assigned to you in this workspace!</p>
            {/* Explicitly wrap it inside a Link or use a native string pathway directly */}
             <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
               </Link>
           </div>
        ) : (
          /* Swapped to grid-cols-4 layout to hold all your functional backend columns cleanly */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* TO DO COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-2 px-1">
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-gray-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300">To Do</h3>
                </div>
                <Badge variant="default">{todoTasks.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {todoTasks.length === 0 ? (
                  <div className="border border-dashed border-dark-border rounded-xl p-4 text-center text-xs text-gray-600">No tasks here</div>
                ) : (
                  todoTasks.map(task => <TaskCard key={task._id || task.id} task={task} />)
                )}
              </div>
            </div>

            {/* IN PROGRESS COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-2 px-1">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-warning" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300">In Progress</h3>
                </div>
                <Badge variant="warning">{inProgressTasks.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {inProgressTasks.length === 0 ? (
                  <div className="border border-dashed border-dark-border rounded-xl p-4 text-center text-xs text-gray-600">No tasks here</div>
                ) : (
                  inProgressTasks.map(task => <TaskCard key={task._id || task.id} task={task} />)
                )}
              </div>
            </div>

            {/* IN REVIEW COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-2 px-1">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-info" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300">In Review</h3>
                </div>
                <Badge variant="info">{inReviewTasks.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {inReviewTasks.length === 0 ? (
                  <div className="border border-dashed border-dark-border rounded-xl p-4 text-center text-xs text-gray-600">No tasks here</div>
                ) : (
                  inReviewTasks.map(task => <TaskCard key={task._id || task.id} task={task} />)
                )}
              </div>
            </div>

            {/* COMPLETED COLUMN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-2 px-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300">Completed</h3>
                </div>
                <Badge variant="success">{doneTasks.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {doneTasks.length === 0 ? (
                  <div className="border border-dashed border-dark-border rounded-xl p-4 text-center text-xs text-gray-600">No tasks here</div>
                ) : (
                  doneTasks.map(task => <TaskCard key={task._id || task.id} task={task} />)
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </PageShell>
  );
};

export default TasksPage;