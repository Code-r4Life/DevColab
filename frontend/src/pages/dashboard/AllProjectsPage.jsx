import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { Button } from "../../components/ui";
import { useWorkspace } from "../../context/useWorkspace";
import { Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";

const AllProjectsPage = () => {
  const { projects, currentWorkspace, fetchProjects } = useWorkspace();
  const [showModal, setShowModal] = useState(false);
  
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("#6366f1");

  useEffect(() => {
    if (currentWorkspace) {
      const wsId = currentWorkspace._id || currentWorkspace.id;
      fetchProjects(wsId);
    }
  }, [currentWorkspace]);

  const handleClose = () => {
    setShowModal(false);
    setProjectName("");
    setProjectColor("#6366f1");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !currentWorkspace) return;

    try {
      const wsId = currentWorkspace._id || currentWorkspace.id;
      await api.post("/projects", {
        name: projectName.trim(),
        color: projectColor,
        workspaceId: wsId
      });

      await fetchProjects(wsId);
      handleClose();
    } catch (err) {
      console.error("Failed to handle project creation workflow:", err);
    }
  };

  // New deletion handler function
  const handleDeleteProject = async (e, projectId) => {
    // 1. Prevent the click from bubbling up to the parent <Link> container
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm("Are you absolutely sure you want to delete this project? This will permanently wipe all tasks, snippets, and wikis.");
    if (!confirmDelete) return;

    try {
      // Hits your backend deleteProject controller function directly
      await api.delete(`/projects/${projectId}`);
      
      // Refresh list immediately
      if (currentWorkspace) {
        const wsId = currentWorkspace._id || currentWorkspace.id;
        await fetchProjects(wsId);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Error deleting project. Make sure your workspace permissions allow this action.");
    }
  };

  return (
    <PageShell breadcrumbs={["Dashboard", "Projects"]}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">All Projects</h1>
            <p className="text-gray-500">Manage and view all active projects in this workspace.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="surface p-12 rounded-xl text-center text-gray-400 bg-white/5">
            No projects found in this workspace. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectId = project._id || project.id;
              return (
                <Link 
                  to={`/project/${projectId}/board`} 
                  key={projectId} 
                  className="surface p-5 rounded-xl hover:translate-y-[-2px] transition-all bg-white/5 group relative block"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl" 
                        style={{ backgroundColor: project.color || "#6366f1" }}
                      >
                        {project.name ? project.name.charAt(0) : "P"}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {project.tasksCount || 0} active tasks
                        </p>
                      </div>
                    </div>
                    
                    {/* Replaced the generic Gear icon with an active, click-isolated Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProject(e, projectId)}
                      className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all z-10"
                      title="Delete Project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>

      {/* Simple overlay modal for creating a project */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface p-6 rounded-2xl w-full max-w-md border border-dark-border space-y-4 bg-[#121214]">
            <div>
              <h3 className="text-lg font-bold text-white">Create New Project</h3>
              <p className="text-xs text-gray-400 mt-0.5">Add a new workspace board to collaborate with your team.</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Marketing Campaign, Redesign"
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
                <Button type="button" variant="ghost" onClick={handleClose}>
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

export default AllProjectsPage;