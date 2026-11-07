import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Circle, Clock, Edit, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function StaffDashboard() {
  const { projects, tasks, updateProject, updateTask, deleteTask, users, getUserNameById } = useData();
  const { user } = useAuth();

  // Cross-reference mock local user with real database user ID
  const realUser = users.find(u => u.email === user?.email);
  const staffId = realUser?._id || user?._id || user?.id;

  const myProjects = projects.filter(p => (p.assignedStaff.includes(staffId) || p.assignedStaff.includes(user?.name)) && p.status !== 'Completed');
  const completedProjects = projects.filter(p => (p.assignedStaff.includes(staffId) || p.assignedStaff.includes(user?.name)) && p.status === 'Completed');
  const staffProjectIds = projects
    .filter(p => p.assignedStaff.includes(staffId) || p.assignedStaff.includes(user?.name))
    .map(p => p._id || p.id);

  // Filter tasks to show tasks related to projects the staff manages
  const myTasks = tasks.filter(t => staffProjectIds.includes(t.projectId));

  const getAssignedNames = (assignedStaff) => {
    if (!assignedStaff || assignedStaff.length === 0) return 'Unassigned';
    return assignedStaff.map(id => {
      const u = users.find(user => (user._id || user.id) === id || user.name === id);
      return u ? u.name : id;
    }).join(', ');
  };

  const handleToggleTask = (task) => {
    if (task.status !== 'Completed' && task.progress < 100) {
      alert("Task progress must be at 100% before marking it as complete.");
      return;
    }
    const currentId = task._id || task.id;
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask(currentId, { status: newStatus, progress: newStatus === 'Completed' ? 100 : (task.progress === 100 ? 99 : task.progress) });
  };

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Staff'}!</h2>
          <p className="text-gray-500">Here's an overview of your active projects and pending tasks.</p>
        </div>

        {/* Projects Section - Full Width */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            Active Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.length === 0 ? (
              <p className="text-gray-500 text-sm italic col-span-full">No active projects assigned.</p>
            ) : (
              myProjects.map(project => (
                <Card key={project._id || project.id} className="hover:shadow-lg transition-shadow duration-200 border-blue-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50/50 rounded-t-xl border-b border-blue-50">
                    <CardTitle className="text-sm font-medium">{project.title || project.name}</CardTitle>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${project.priority === 'High' ? 'bg-red-100 text-red-800' :
                        project.priority === 'Low' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {project.priority || 'Medium'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className={`text-3xl font-bold mb-2 ${project.progress === 100 ? 'text-green-600' : project.progress > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {project.progress}%
                    </div>
                    <p className="text-xs text-gray-500 mb-0 mt-4 flex justify-between items-center px-1 bg-gray-50 py-1.5 rounded-md">
                      <span>Assigned Staff:</span>
                      <span className="font-semibold text-gray-700">{getAssignedNames(project.assignedStaff)}</span>
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed Projects Section */}
        {completedProjects.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              Completed Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProjects.map(project => (
                <Card key={project._id || project.id} className="hover:shadow-lg transition-shadow duration-200 border-green-200 bg-green-50/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-100/50 rounded-t-xl border-b border-green-100">
                    <CardTitle className="text-sm font-medium text-green-900 line-through decoration-green-900/30">{project.title || project.name}</CardTitle>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full opacity-60 ${project.priority === 'High' ? 'bg-red-100 text-red-800' :
                        project.priority === 'Low' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {project.priority || 'Medium'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-bold flex items-center gap-1">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold mb-2 text-green-600 flex items-center gap-2">
                      <CheckCircle size={22} className="fill-green-100" />
                      100%
                    </div>
                    <p className="text-xs text-gray-500 mb-0 mt-4 flex justify-between items-center px-1 bg-white/50 py-1.5 rounded-md mix-blend-multiply">
                      <span>Assigned Staff:</span>
                      <span className="font-semibold text-green-800">{getAssignedNames(project.assignedStaff)}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section - Different Style */}
        {/* Pending Tasks Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
            Your Task List
          </h3>
          <Card className="border-none shadow-sm bg-gray-50/50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <AnimatePresence>
                  {myTasks.filter(t => t.status !== 'Completed').length === 0 ? (
                    <p className="text-gray-500 text-sm italic text-center py-8">All caught up! No pending tasks.</p>
                  ) : (
                    myTasks.filter(t => t.status !== 'Completed').map(task => (
                      <motion.div
                        key={task._id || task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-white border-gray-100 hover:border-green-300 hover:shadow-md transition-all duration-200"
                      >
                        <button
                          onClick={() => handleToggleTask(task)}
                          disabled={task.progress < 100}
                          className={`flex-shrink-0 transition-colors transform active:scale-90 ${task.progress < 100 ? 'opacity-40 cursor-not-allowed text-gray-200' : 'text-gray-300 hover:text-green-500'}`}
                          title={task.progress < 100 ? "Task progress must be 100% to complete" : "Mark as Complete"}
                        >
                          <Circle size={28} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900">{task.title}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {task.deadline || task.dueDate || 'No Date'}</span>
                            {task.priority && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {task.priority}
                              </span>
                            )}
                            <span className="flex flex-shrink-0 items-center gap-1 font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full outline outline-1 outline-blue-200 ml-auto">
                              👤 Volunteer: {getUserNameById(task.assignedTo)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => { setDeleteId(task._id || task.id); setIsDeleteModalOpen(true); }}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Tasks Section */}
        {myTasks.some(t => t.status === 'Completed') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
              Completed Tasks
            </h3>
            <Card className="border-none shadow-sm bg-gray-50/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {myTasks.filter(t => t.status === 'Completed').map(task => (
                    <div key={task._id || task.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white/60 border-gray-100 opacity-75">
                      <div className="flex-shrink-0 text-green-500">
                        <CheckCircle size={28} className="fill-green-100" />
                      </div>
                      <div className="flex-1 min-w-0 flex justify-between items-center pr-4">
                        <div>
                          <p className="text-base font-medium line-through text-gray-400">{task.title}</p>
                          <p className="text-xs text-gray-400">Completed</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">👤 Volunteer: {getUserNameById(task.assignedTo)}</span>
                      </div>
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Undo
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            if (deleteId) {
              deleteTask(deleteId);
              setIsDeleteModalOpen(false);
            }
          }}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
        />
      </div>
    </DashboardLayout>
  );
}
