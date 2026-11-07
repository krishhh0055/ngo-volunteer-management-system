import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Circle, Clock, Filter, FolderKanban, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function StaffTasks() {
  const { tasks, updateTask, projects, users, getUserNameById } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  // Cross-reference mock local user with real database user ID
  const realUser = users.find(u => u.email === user?.email);
  const staffId = realUser?._id || user?._id || user?.id;

  const staffProjectIds = projects
    .filter(p => p.assignedStaff?.includes(staffId) || p.assignedStaff?.includes(user?.name))
    .map(p => p._id || p.id);

  // Filter tasks to show tasks related to projects the staff manages
  const myTasks = tasks.filter(t => staffProjectIds.includes(t.projectId));

  const filteredTasks = myTasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return task.status !== 'Completed';
    if (filter === 'Completed') return task.status === 'Completed';
    return true;
  });

  const handleToggleTask = (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask(task._id || task.id, { status: newStatus, progress: newStatus === 'Completed' ? 100 : 0 });
  };

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Assigned Tasks</h2>

          <div className="flex gap-2">
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <AnimatePresence mode='popLayout'>
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-center py-12"
                  >
                    <Filter className="mx-auto w-12 h-12 text-gray-300 mb-2" />
                    <p>No tasks found in this category.</p>
                  </motion.div>
                ) : (
                  Object.values(filteredTasks.reduce((acc, task) => {
                    const projTitle = projects.find(p => (p._id || p.id) === task.projectId)?.title || task.project || 'General Tasks';
                    const projId = task.projectId || 'general';
                    const isTaskCompleted = task.status === 'Completed';

                    // Group by Project
                    if (!acc[projId]) {
                      acc[projId] = {
                        projectId: projId,
                        projectName: projTitle,
                        isCompletedProject: projects.find(p => (p._id || p.id) === projId)?.status === 'Completed',
                        tasks: []
                      };
                    }
                    acc[projId].tasks.push(task);
                    return acc;
                  }, {})).map(projectGroup => (
                    <motion.div
                      layout
                      key={projectGroup.projectId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-8 last:mb-0"
                    >
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
                        <div>Project: <span className="text-primary-600">{projectGroup.projectName}</span></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${projectGroup.isCompletedProject ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {projectGroup.isCompletedProject ? 'Completed Project' : 'Active Project'}
                        </span>
                      </h3>

                      <div className="space-y-4 pl-0 md:pl-4 md:border-l-2 md:border-gray-100">
                        {projectGroup.tasks.map(task => (
                          <div key={task._id || task.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3">
                            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2">
                              <div className="flex items-center gap-3">
                                <h4 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h4>
                                {task.priority && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                     ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {task.priority || 'Medium'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} /> {task.deadline || task.dueDate || 'No Date'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-3 mt-1">
                              <div className="flex items-center justify-between text-sm bg-white p-2.5 rounded-md border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">👤 {getUserNameById(task.assignedTo)}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className={`inline-block px-2.5 py-0.5 text-xs font-bold tracking-wide rounded border
                                      ${task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                      task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                    {task.status}
                                  </span>
                                  <div className="hidden sm:block w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                     <div 
                                       className={`h-full rounded-full transition-all duration-300 ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                       style={{ width: `${task.progress || 0}%` }}
                                     />
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 w-8 text-right">{task.progress || 0}%</span>
                                  {task.attachmentUrl && (
                                    <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600 hover:bg-purple-100">
                                      <Paperclip size={10} /> Document
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Volunteer Daily Logs Display */}
                              {task.dailyLogs && task.dailyLogs.length > 0 && (
                                <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Volunteer Activity Logs</p>
                                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                    {[...task.dailyLogs].reverse().map((log, idx) => (
                                      <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{log.date}</span>
                                        <p className="text-xs text-gray-700">{log.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Legacy Remarks Display (Fallback) */}
                              {!task.dailyLogs?.length && task.remarks && (
                                <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Legacy Volunteer Remarks</p>
                                  <p className="text-sm text-gray-700 italic">"{task.remarks}"</p>
                                </div>
                              )}

                              {/* Staff Progress Control */}
                              {task.status !== 'Completed' && (
                                <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm mt-2">
                                  <StaffTaskProgressEditor task={task} updateTask={updateTask} />

                                  <div className="flex justify-end mt-3 border-t border-gray-100 pt-3">
                                    <button
                                      onClick={() => handleToggleTask(task)}
                                      disabled={task.progress < 100}
                                      className={`flex items-center gap-1 font-bold transition-all px-4 py-2 text-xs rounded-md ${task.progress === 100
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                      <CheckCircle size={14} />
                                      {task.progress === 100 ? 'Verify & Complete' : 'Task Incomplete'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StaffTaskProgressEditor({ task, updateTask }) {
  const [value, setValue] = useState(task.progress || 0);

  // Sync if it changes externally
  useEffect(() => {
    setValue(task.progress || 0);
  }, [task.progress]);

  const handleSave = () => {
    if (value !== task.progress) {
      updateTask(task._id || task.id, { progress: value });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-gray-600">Update Progress:</span>
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-16 h-6 text-xs border border-gray-300 rounded text-center"
        />
        <span className="text-xs text-gray-400">%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600 mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        style={{
          background: `linear-gradient(to right, #16a34a ${value}%, #e5e7eb ${value}%)`
        }}
      />
      {value !== (task.progress || 0) && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => setValue(task.progress || 0)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded hover:bg-green-600 transition-colors"
          >
            Update Progress
          </button>
        </div>
      )}
    </>
  );
}
