import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { CheckCircle, Clock, Edit, Trash2, DollarSign, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProjectProgressSlider } from '../../components/ui/ProjectProgressSlider';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export default function StaffProjects() {
  const { projects, updateProject, expenses, addExpense, deleteExpense, addTask, tasks, users, deleteTask, updateTask, getUserNameById } = useData();
  const { user } = useAuth();

  // Cross-reference mock local user with real database user ID
  const realUser = users?.find(u => u.email === user?.email);
  const staffId = realUser?._id || user?._id || user?.id;

  const allProjects = projects.filter(p => (
    p.assignedStaff?.includes(staffId) ||
    p.assignedStaff?.includes(user?.name) ||
    p.assignedStaff?.includes(user?.email) ||
    p.assignedStaff?.includes(user?.id) ||
    p.assignedStaff?.includes(user?._id)
  ));
  const activeProjects = allProjects.filter(p => p.status !== 'Completed');
  const completedProjects = allProjects.filter(p => p.status === 'Completed');
  const [editingProject, setEditingProject] = useState(null);

  // Task Assignment State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState(null);
  const [newTaskData, setNewTaskData] = useState({ title: '', description: '', assignedTo: [], priority: 'Medium', deadline: '' });
  const [taskFile, setTaskFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);

  // Expenses State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedProjectForExpense, setSelectedProjectForExpense] = useState(null);
  const [newExpenseData, setNewExpenseData] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let attachmentUrl = '';

    if (taskFile) {
      const formData = new FormData();
      formData.append('file', taskFile);
      try {
        const res = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url) {
          attachmentUrl = `http://localhost:5001${data.url}`;
        }
      } catch (error) {
        console.error('File upload failed', error);
      }
    }

    addTask({
      ...newTaskData,
      projectId: selectedProjectForTask,
      status: 'Pending',
      progress: 0,
      attachmentUrl
    });
    
    setIsUploading(false);
    setIsTaskModalOpen(false);
    setNewTaskData({ title: '', description: '', assignedTo: [], priority: 'Medium', deadline: '' });
    setTaskFile(null);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    addExpense({
      ...newExpenseData,
      projectId: selectedProjectForExpense,
      addedBy: staffId
    });
    setNewExpenseData({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  // Render helper to reuse list logic
  const renderProjects = (projList, isCompleted = false) => {
    if (projList.length === 0) return <p className="text-gray-500 text-sm italic col-span-full">No projects found.</p>;

    return projList.map(project => (
      <Card key={project._id || project.id} className={`hover:shadow-md transition-shadow ${isCompleted ? 'bg-gray-50 opacity-80' : ''}`}>
        <CardContent className="pt-6">
          <motion.div layout>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-gray-900 line-clamp-1" title={project.title}>{project.title}</h4>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 flex items-center h-fit rounded-full font-medium ${project.priority === 'High' ? 'bg-red-100 text-red-700' :
                  project.priority === 'Low' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {project.priority || 'Medium'}
                </span>
                <span className={`text-xs px-2 py-1 flex items-center h-fit rounded-full font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                  {project.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{project.description}</p>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-semibold text-gray-700">Progress</span>
                <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            {/* Task List Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">In Progress</h4>
              {tasks.filter(t => t.projectId === (project._id || project.id)).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tasks assigned.</p>
              ) : (
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-2 max-h-[250px] overflow-y-auto">
                    {tasks.filter(t => t.projectId === (project._id || project.id) && t.status !== 'Completed').map(task => (
                      <div key={task.id} className="flex flex-col gap-2 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{task.title}</p>
                              {task.weight && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded border border-purple-200" title="Project Impact">
                                  {Math.round(task.weight)}%
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500">👤 {getUserNameById(task.assignedTo)}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                              {task.status}
                            </span>
                            {!isCompleted && (
                              <button
                                onClick={() => { setDeleteTaskId(task._id || task.id); setIsDeleteTaskModalOpen(true); }}
                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <StaffProjectTaskProgressEditor task={task} updateTask={updateTask} />

                        {/* Volunteer Daily Logs Display */}
                        {task.dailyLogs && task.dailyLogs.length > 0 && (
                          <div className="mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                            <div className="text-[9px] uppercase font-bold text-blue-800 mb-1.5 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                              Activity Logs
                            </div>
                            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                              {[...task.dailyLogs].reverse().map((log, idx) => {
                                // Backward compatibility formatting for old vs new logs
                                const displayDesc = log.description.includes('👤')
                                  ? log.description
                                  : `👤 Volunteer ${getUserNameById(task.assignedTo)}: ${log.description}`;

                                return (
                                  <div key={idx} className="bg-white p-1.5 rounded border border-blue-50">
                                    <span className="text-[9px] font-bold text-gray-400 block mb-0.5">{log.date}</span>
                                    <p className="text-[10px] text-gray-700 leading-tight">{displayDesc}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Legacy Remarks Fallback */}
                        {!task.dailyLogs?.length && task.remarks && (
                          <div className="mt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100 text-[10px] text-amber-700 font-medium italic leading-relaxed">
                            "{task.remarks}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                {tasks.filter(t => t.projectId === (project._id || project.id) && t.status === 'Completed').length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Completed Tasks</h4>
                    <div className="space-y-2 opacity-70 border border-gray-100 rounded-lg p-2 bg-gray-50 max-h-[150px] overflow-y-auto">
                      {tasks.filter(t => t.projectId === (project._id || project.id) && t.status === 'Completed').map(task => (
                        <div key={task.id} className="flex flex-col gap-1 text-xs bg-gray-50/50 p-2 rounded border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={12} className="text-green-500" />
                              <p className="font-medium text-gray-500 line-through">{task.title}</p>
                            </div>
                            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 rounded">Completed</span>
                          </div>
                          <p className="text-gray-400 pl-5">👤 {getUserNameById(task.assignedTo)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} /> Due {project.endDate}
              </span>

              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <>
                    <button
                      onClick={() => { setSelectedProjectForExpense(project._id || project.id); setIsExpenseModalOpen(true); }}
                      className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors mr-2"
                    >
                      <DollarSign size={12} /> Manage Expenses
                    </button>
                    <button
                      onClick={() => { setSelectedProjectForTask(project._id || project.id); setIsTaskModalOpen(true); }}
                      className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                    >
                      <Edit size={12} /> Assign Task
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <DashboardLayout role="staff">
      <div className="space-y-8">

        {/* Active Projects */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderProjects(activeProjects, false)}
          </div>
        </section>

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 opacity-80">
              <CheckCircle className="text-green-600" /> Completed Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderProjects(completedProjects, true)}
            </div>
          </section>
        )}

        {/* Task Assignment Modal */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Assign Task to Volunteer</h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    required
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTaskData.title}
                    onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
                    placeholder="e.g. Distribute Flyers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Description / Instructions</label>
                  <textarea
                    rows={2}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTaskData.description}
                    onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
                    placeholder="Describe what the volunteer needs to do..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm mb-2"
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (val && !newTaskData.assignedTo.includes(val)) {
                        setNewTaskData({ ...newTaskData, assignedTo: [...newTaskData.assignedTo, val] });
                      }
                    }}
                  >
                    <option value="">Select Volunteer to Add...</option>
                    {users.filter(u => u.role === 'volunteer' && !newTaskData.assignedTo.includes(u.name)).map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {newTaskData.assignedTo.map(volunteer => (
                      <span key={volunteer} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {volunteer}
                        <button
                          type="button"
                          onClick={() => setNewTaskData({ ...newTaskData, assignedTo: newTaskData.assignedTo.filter(v => v !== volunteer) })}
                          className="hover:text-blue-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full border rounded-lg p-2 text-sm"
                      value={newTaskData.priority}
                      onChange={e => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Impact (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="Optional (e.g. 25)"
                      value={newTaskData.weight || ''}
                      onChange={e => setNewTaskData({ ...newTaskData, weight: e.target.value })}
                    />
                    {newTaskData.assignedTo.length > 1 && newTaskData.weight > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        ≈ {tasks.length > 0 ? (newTaskData.weight / newTaskData.assignedTo.length).toFixed(1) : (newTaskData.weight / newTaskData.assignedTo.length).toFixed(1)}% per volunteer
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      required
                      className="w-full border rounded-lg p-2 text-sm"
                      value={newTaskData.deadline}
                      onChange={e => setNewTaskData({ ...newTaskData, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document (Optional)</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={e => setTaskFile(e.target.files[0])}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {taskFile && <span className="text-xs text-gray-500 flex items-center gap-1">Selected: {taskFile.name} <button type="button" onClick={() => setTaskFile(null)} className="text-red-500 font-bold ml-2">×</button></span>}
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button type="submit" disabled={isUploading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                    {isUploading ? 'Uploading & Assigning...' : 'Assign Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}


      </div>
      {/* Expenses Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Project Expenses</h3>
                <p className="text-sm text-gray-500">Manage expenses for {projects.find(p => (p._id || p.id) === selectedProjectForExpense)?.title}</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-900">₹{(projects.find(p => (p._id || p.id) === selectedProjectForExpense)?.budget || 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-orange-600 font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-orange-900">
                      ₹{expenses.filter(e => e.projectId === selectedProjectForExpense).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-600 font-medium">Remaining Balance</p>
                    <p className="text-2xl font-bold text-green-900">
                      ₹{Math.max(0, (projects.find(p => (p._id || p.id) === selectedProjectForExpense)?.budget || 0) - expenses.filter(e => e.projectId === selectedProjectForExpense).reduce((sum, e) => sum + Number(e.amount), 0)).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Add New Expense Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Plus size={16} /> Add New Expense</h4>
                <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <input
                      required
                      className="w-full border rounded p-2 text-sm"
                      placeholder="e.g. Travel costs"
                      value={newExpenseData.title}
                      onChange={e => setNewExpenseData({ ...newExpenseData, title: e.target.value })}
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      className="w-full border rounded p-2 text-sm"
                      placeholder="0.00"
                      value={newExpenseData.amount}
                      onChange={e => setNewExpenseData({ ...newExpenseData, amount: e.target.value })}
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                    <input
                      required
                      type="date"
                      className="w-full border rounded p-2 text-sm"
                      value={newExpenseData.date}
                      onChange={e => setNewExpenseData({ ...newExpenseData, date: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition">Add</button>
                </form>
              </div>

              {/* Expense List */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Expense History</h4>
                {expenses.filter(e => e.projectId === selectedProjectForExpense).length === 0 ? (
                  <p className="text-gray-400 text-sm italic text-center py-4">No expenses recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {expenses.filter(e => e.projectId === selectedProjectForExpense).map(expense => (
                      <div key={expense.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div>
                          <p className="font-medium text-gray-800">{expense.title}</p>
                          <p className="text-xs text-gray-500">{expense.date} • Added by Staff</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">₹{Number(expense.amount).toLocaleString()}</span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete Expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteTaskModalOpen}
        onClose={() => setIsDeleteTaskModalOpen(false)}
        onConfirm={() => deleteTask(deleteTaskId)}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />
    </DashboardLayout >
  );
}

function StaffProjectTaskProgressEditor({ task, updateTask }) {
  const [value, setValue] = useState(task.progress || 0);

  // Sync with external updates
  useEffect(() => {
    setValue(task.progress || 0);
  }, [task.progress]);

  const handleSave = () => {
    if (value !== task.progress) {
      updateTask(task._id || task.id, { progress: value });
    }
  };

  return (
    <div className="mt-2 px-1">
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-xs font-semibold text-blue-600 w-8 text-right">{value}%</span>
      </div>
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
    </div>
  );
}
