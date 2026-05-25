import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button, Badge } from "../../components/ui"; 
import { cn } from "../../assets/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useWorkspace } from "../../context/useWorkspace";
import api, { unwrap } from "../../lib/api";

const CalendarPage = () => {
  const { currentWorkspace, projects, fetchProjects } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Local state parameters for the project quick-creation modal overlay
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("#6366f1");

  useEffect(() => {
    async function loadWorkspaceTasks() {
      if (!currentWorkspace) return;
      try {
        setLoading(true);
        const wsId = currentWorkspace._id || currentWorkspace.id;
        const res = unwrap(await api.get(`/tasks/workspace/${wsId}/me`));
        setTasks(res.tasks || []);
      } catch (err) {
        console.error("failed to load schedule tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceTasks();
  }, [currentWorkspace, projects]);

  const year = currentDate?.getFullYear() || new Date().getFullYear();
  const month = typeof currentDate?.getMonth === 'function' ? currentDate.getMonth() : new Date().getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay() || 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate() || 30;

  const calendarSlots = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarSlots.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarSlots.push(d);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Open creation window contextualized to the specific date box clicked
  const handleOpenCreateModal = (dayNum) => {
    setSelectedDay(dayNum);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDay(null);
    setProjectName("");
    setProjectColor("#6366f1");
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !currentWorkspace || !selectedDay) return;

    try {
      const wsId = currentWorkspace._id || currentWorkspace.id;
      
      // Construct an explicit ISO timestamp matching the selected grid date box cell at noon local time
      const computedTargetDate = new Date(year, month, selectedDay, 12, 0, 0).toISOString();

      // Post the new project with the custom target timestamp parameter attached
      await api.post("/projects", {
        name: projectName.trim(),
        color: projectColor,
        workspaceId: wsId,
        targetDate: computedTargetDate
      });

      // Synchronize context states immediately
      await fetchProjects(wsId);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to create project from calendar quick hook:", err);
    }
  };

  // COMBINED FILTER ENGINE: Solves the timezone conversion loophole cleanly
  const getItemsForDay = (dayNum) => {
    if (!dayNum) return [];

    // Formats calendar day parameters into an explicit comparison string stub (YYYY-MM-DD)
    const targetString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

    // 1. Core Task Filtering using localized ISO parsing strings
    const dayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate.startsWith(targetString) || new Date(task.dueDate).toISOString().startsWith(targetString);
    });

    // 2. Project Milestone Filtering (Show project indicators on creation date)
    const safeProjects = Array.isArray(projects) ? projects : [];
    const dayProjects = safeProjects.filter(project => {
      if (!project.createdAt) return false;
      return project.createdAt.startsWith(targetString) || new Date(project.createdAt).toISOString().startsWith(targetString);
    });

    // Merge both arrays with clear property boundaries to eliminate rendering holes
    return [
      ...dayProjects.map(p => ({
        _id: p._id || p.id,
        title: `📁 Project: ${p.name}`,
        isProjectMarker: true,
        color: p.color || "#6366f1"
      })),
      ...dayTasks.map(t => ({
        ...t,
        isProjectMarker: false
      }))
    ];
  };

  return (
    <PageShell breadcrumbs={["Dashboard", "My Schedule"]}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Schedule</h1>
            <p className="text-gray-500">Deadlines and trackable targets mapped out across your calendar.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-dark-border p-1.5 rounded-xl self-start sm:self-auto">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="p-1 h-auto">
              <ChevronLeft size={18} />
            </Button>
            <span className="font-bold text-sm min-w-[120px] text-center text-gray-200">
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="p-1 h-auto">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="surface p-12 rounded-xl text-center text-gray-400">Loading your calendar timeline...</div>
        ) : (
          <div className="surface border border-dark-border rounded-2xl overflow-hidden bg-[#121214]">
            
            <div className="grid grid-cols-7 border-b border-dark-border bg-white/5 text-center py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-dark-border/30 gap-[1px]">
              {calendarSlots.map((day, idx) => {
                const dayItems = getItemsForDay(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[120px] bg-[#121214] p-2 space-y-2 flex flex-col justify-between group",
                      !day && "bg-transparent/20 opacity-30"
                    )}
                  >
                    {day ? (
                      <div className="flex items-center justify-between w-full">
                        <span className={cn(
                          "text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          isToday ? "bg-primary text-white" : "text-gray-400"
                        )}>
                          {day}
                        </span>
                        
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => handleOpenCreateModal(day)}
                            className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                            title="Quick create a project board"
                          >
                            <Plus size={12} />
                          </button>
                          {dayItems.length > 0 && (
                            <Badge variant="primary" className="text-[9px] px-1 py-0 h-4">{dayItems.length}</Badge>
                          )}
                        </div>
                      </div>
                    ) : <div />}

                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] scrollbar-none pt-1">
                      {dayItems.slice(0, 3).map(item => {
                        const pId = item.isProjectMarker ? item._id : (item.projectId?._id || item.projectId);
                        return (
                          <Link
                            key={item._id || item.id}
                            to={pId ? `/project/${pId}/board` : "/dashboard"}
                            className={cn(
                              "block text-[10px] p-1 rounded border transition-colors truncate text-gray-300 font-medium",
                              item.isProjectMarker 
                                ? "bg-primary/20 border-primary/30 text-primary-light" 
                                : "bg-white/5 border-dark-border/40 hover:border-primary/50"
                            )}
                            title={item.title}
                          >
                            <span className="truncate flex items-center gap-1">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                item.isProjectMarker ? "" : (item.priority === "P0" ? "bg-danger" : item.priority === "P1" ? "bg-warning" : "bg-info")
                              )} style={item.isProjectMarker ? { backgroundColor: item.color } : {}} />
                              {item.title}
                            </span>
                          </Link>
                        );
                      })}
                      {dayItems.length > 3 && (
                        <p className="text-[9px] text-gray-500 font-medium pl-1">
                          + {dayItems.length - 3} more...
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Pop-up creation layout layer */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface p-6 rounded-2xl w-full max-w-md border border-dark-border space-y-4 bg-[#121214]">
            <div>
              <h3 className="text-lg font-bold text-white">Create New Project</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Adding a new workspace board milestone for{" "}
                <span className="text-primary font-bold">{monthNames[month]} {selectedDay}, {year}</span>.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Development Sprint, Client Alpha"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-white/5 border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color"
                    value={projectColor}
                    onChange={(e) => setProjectColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-dark-border cursor-pointer overflow-hidden p-0"
                  />
                  <span className="text-xs text-gray-400 uppercase font-mono">{projectColor}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-dark-border/40">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!projectName.trim()}>
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CalendarPage;