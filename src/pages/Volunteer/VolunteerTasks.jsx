import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { CheckCircle, Circle, Clock, Filter, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

export default function VolunteerTasks() {
  const { tasks, projects, updateTask, getUserNameById, users } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  // Match the mock auth user with the real database user to get the _id
  const dbUser = users.find(u => u.email === user?.email) || user;

  // Identify projects the user is involved in (assigned to, or has tasks in)
  const myTasks = tasks.filter(t => t.assignedTo === dbUser?.name || t.assignedTo === dbUser?.id || t.assignedTo === dbUser?._id);
  const myInvolvedProjectIds = [...new Set(myTasks.map(t => t.projectId))];

  // Get project details
  const myProjects = projects.filter(p => myInvolvedProjectIds.includes(p.id) || myInvolvedProjectIds.includes(p._id));

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">My Projects & Tasks</h2>

          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {myProjects.filter(project => {
          if (filter === 'Completed') return project.progress === 100;
          if (filter === 'Pending') return project.progress < 100;
          return true;
        }).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No {filter.toLowerCase()} projects or tasks found.</p>
            </CardContent>
          </Card>
        ) : (
          myProjects.filter(project => {
            if (filter === 'Completed') return project.progress === 100;
            if (filter === 'Pending') return project.progress < 100;
            return true;
          }).map(project => {
            const projId = project.id || project._id;
            const projectTasks = tasks.filter(t => t.projectId === projId);

            const myProjectTasks = projectTasks.filter(t =>
              (t.assignedTo === dbUser?.name || t.assignedTo === dbUser?.id || t.assignedTo === dbUser?._id) &&
              (filter === 'All' || (filter === 'Pending' ? t.status !== 'Completed' : t.status === 'Completed'))
            );

            const teamProjectTasks = projectTasks.filter(t =>
              t.assignedTo !== dbUser?.name &&
              t.assignedTo !== dbUser?.id &&
              t.assignedTo !== dbUser?._id &&
              (filter === 'All' || (filter === 'Pending' ? t.status !== 'Completed' : t.status === 'Completed'))
            );

            return (
              <Card key={projId} className="overflow-hidden border-t-[3px] border-t-primary-500 shadow-sm">
                <CardHeader className="bg-white pb-4 border-b border-gray-100 px-6 pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">{project.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">PROJECT PROGRESS</span>
                      <span className={`text-2xl font-bold ${project.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{project.progress || 0}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 grid md:grid-cols-2 gap-8 bg-[#fafafa]/50">
                  {/* Left Column: My Tasks */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full"></div>
                      My Assignments
                    </h3>
                    <div className="space-y-4">
                      {myProjectTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No {filter.toLowerCase()} tasks assigned to you.</p>
                      ) : (
                        myProjectTasks.map(task => (
                          <VolunteerTaskCard key={task.id || task._id} task={task} updateTask={updateTask} />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Team Tasks */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      Team Activity
                    </h3>
                    <div className="space-y-3">
                      {teamProjectTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No other team activity found.</p>
                      ) : (
                        teamProjectTasks.map(task => (
                          <TeamTaskCard key={task.id || task._id} task={task} />
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}

// Helper for Team Task Card (Read Only)
function TeamTaskCard({ task }) {
  const { getUserNameById } = useData();
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc]/50">
      <div className={`flex-shrink-0 ${task.status === 'Completed' ? 'text-green-500' : 'text-gray-300'}`}>
        {task.status === 'Completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[13px] font-semibold text-gray-900 truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-blue-100/50 text-blue-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                👤 {getUserNameById(task.assignedTo)}
              </span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {task.deadline || task.dueDate || 'No Date'}
              </span>
              {task.status !== 'Completed' && (task.deadline || task.dueDate) && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const deadline = new Date(task.deadline || task.dueDate);
                  deadline.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                  return diffDays < 0 ? 'bg-red-100 text-red-700' : diffDays <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
                })()
                  }`}>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadline = new Date(task.deadline || task.dueDate);
                    deadline.setHours(0, 0, 0, 0);
                    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                    return diffDays < 0 ? `${Math.abs(diffDays)}d Overdue` : diffDays === 0 ? 'Due Today' : `${diffDays}d Left`;
                  })()}
                </span>
              )}
              {task.attachmentUrl && (
                <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 hover:bg-purple-200">
                  <Paperclip size={10} /> Attachment
                </a>
              )}
            </div>
          </div>
          <span className="text-[11px] text-gray-400 mt-0.5">{task.progress || 0}%</span>
        </div>
      </div>
    </div>
  );
}

// ... existing VolunteerTaskCard ...

function VolunteerTaskCard({ task, updateTask }) {
  const { user } = useAuth();
  const { getUserNameById } = useData();
  const [localRemarks, setLocalRemarks] = useState(task.remarks || '');

  const handleSubmitUpdate = () => {
    if (localRemarks !== task.remarks) {
      updateTask(task.id || task._id, {
        remarks: localRemarks,
        newLog: {
          date: new Date().toISOString().split('T')[0],
          description: `👤 ${user?.name || 'Volunteer'}: ${localRemarks}`
        }
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 ${task.status === 'Completed' ? 'bg-gray-50/50 border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:border-[#0ea5e9]/30 hover:shadow-md'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            disabled={true}
            className={`flex-shrink-0 mt-0.5 transition-colors ${task.status === 'Completed' ? 'text-green-500' : 'text-gray-200'}`}
          >
            {task.status === 'Completed' ? <CheckCircle size={22} className="fill-green-50" /> : <Circle size={22} strokeWidth={2.5} />}
          </button>
          <div>
            <p className={`text-[15px] font-bold mb-1 tracking-tight ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
            {task.description && (
              <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">{task.description}</p>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'High' ? 'bg-red-50 text-red-600' :
              task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
              }`}>
              {task.priority || 'Low'}
            </span>
            {task.attachmentUrl && (
              <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600 hover:bg-purple-100">
                <Paperclip size={10} /> View Document
              </a>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className={`text-2xl font-bold leading-none ${task.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{task.progress || 0}%</span>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Completed</span>
        </div>
      </div>

      {task.status !== 'Completed' && (
        <div className="pl-8 pr-1 mt-2">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1.5">Work Details / Remarks</label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="w-full text-[13px] p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0ea5e9] outline-none text-gray-700 placeholder-gray-400"
                placeholder="Describe what you did (e.g., 'Visited 5 families', 'Drafted content')..."
                value={localRemarks}
                onChange={(e) => setLocalRemarks(e.target.value)}
              />

              {localRemarks !== (task.remarks || '') && (
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleSubmitUpdate}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0ea5e9] text-white text-[11px] font-bold uppercase rounded-md hover:bg-[#0284c7] transition-colors"
                  >
                    Send Update
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-gray-400 italic">
            Click 'Send Update' to notify staff about your progress
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
              <Clock size={12} className="text-gray-400" /> Due {task.deadline || task.dueDate || 'No Date'}
            </div>
            {(task.deadline || task.dueDate) && (
              <div className="mt-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <span className={`text-[11px] font-bold ${(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const deadline = new Date(task.deadline || task.dueDate);
                  deadline.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                  return diffDays < 0 ? 'text-red-500' : diffDays <= 2 ? 'text-orange-500' : 'text-red-500';
                })()
                  }`}>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadline = new Date(task.deadline || task.dueDate);
                    deadline.setHours(0, 0, 0, 0);
                    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                    return diffDays < 0 ? `${Math.abs(diffDays)} Days Overdue` : diffDays === 0 ? 'Due Today' : `${diffDays} Days Left`;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {task.status === 'Completed' && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 pl-8 mt-2">
          <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-400" /> Due {task.deadline || task.dueDate || 'No Date'}</span>
        </div>
      )}
    </motion.div>
  );
}
