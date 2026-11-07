import { useState } from 'react';
import { Plus, Search, Calendar, User, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskManagement() {
  const { tasks, addTask, updateTask, deleteTask, projects, users, getUserNameById } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [taskFile, setTaskFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '', // In a real app this would be a user ID
    deadline: '',
    priority: 'Medium'
  });

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserNameById(t.assignedTo).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let attachmentUrl = '';

    if (taskFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', taskFile);
      try {
        const res = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          body: formDataUpload
        });
        const data = await res.json();
        if (data.url) {
          attachmentUrl = `http://localhost:5001${data.url}`;
        }
      } catch (error) {
        console.error('File upload failed', error);
      }
    }

    const project = projects.find(p => p._id === formData.projectId || p.id === formData.projectId);
    addTask({
      ...formData,
      projectId: project ? (project._id || project.id) : '',
      project: project ? project.title : 'General',
      status: 'Pending',
      progress: 0,
      attachmentUrl
    });
    
    setIsUploading(false);
    setIsCreating(false);
    setFormData({ title: '', description: '', projectId: '', assignedTo: '', deadline: '', priority: 'Medium' });
    setTaskFile(null);
  };

  const projectsGroup = Object.values(filteredTasks.reduce((acc, task) => {
    const projKey = task.projectId;
    if (!acc[projKey]) {
      const projectDoc = projects.find(p => p._id === projKey || p.id === projKey);
      acc[projKey] = {
        projectId: projKey,
        projectName: projectDoc ? projectDoc.title : (task.project || 'General'),
        taskGroups: {}
      };
    }

    const taskKey = task.title;
    if (!acc[projKey].taskGroups[taskKey]) {
      acc[projKey].taskGroups[taskKey] = {
        key: `${projKey}-${taskKey}`,
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        assignees: []
      };
    }
    acc[projKey].taskGroups[taskKey].assignees.push(task);
    return acc;
  }, {})).map(proj => ({
    ...proj,
    taskGroups: Object.values(proj.taskGroups)
  }));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus size={18} className="mr-2" />
            Assign Task
          </Button>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-primary-100 bg-primary-50/30">
                <CardHeader>
                  <CardTitle>Assign New Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Task Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(p => (
                          <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                      <textarea
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        placeholder="Describe what needs to be done..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Volunteer)</label>
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        required
                      >
                        <option value="">Select Volunteer/Staff</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document (Optional)</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          onChange={e => setTaskFile(e.target.files[0])}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {taskFile && <span className="text-xs text-gray-500 flex items-center gap-1">Selected: {taskFile.name} <button type="button" onClick={() => setTaskFile(null)} className="text-red-500 font-bold ml-2">×</button></span>}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <Button variant="ghost" onClick={() => setIsCreating(false)} type="button">Cancel</Button>
                      <Button type="submit" disabled={isUploading}>
                        {isUploading ? 'Uploading & Assigning...' : 'Assign Task'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 w-full max-w-sm rounded-md border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {projectsGroup.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks found.</p>
                ) : (
                  projectsGroup.map((project) => (
                    <motion.div
                      key={project.projectId}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mb-8 last:mb-0"
                    >
                      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                        Project: <span className="text-primary-600">{project.projectName}</span>
                      </h3>

                      <div className="space-y-4 pl-0 md:pl-4 md:border-l-2 md:border-gray-100">
                        {project.taskGroups.map((group) => (
                          <div
                            key={group.key}
                            className="flex flex-col p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3"
                          >
                            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-gray-900">{group.title}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                   ${group.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    group.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {group.priority}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} /> {group.deadline}
                                </span>
                              </div>
                            </div>

                            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 space-y-2 mt-1">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Volunteers</p>
                              {group.assignees.map(task => (
                                <div key={task._id || task.id} className="flex items-center justify-between text-sm bg-white p-2.5 rounded-md border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <User size={14} className="text-gray-400" />
                                    <span className="font-medium text-gray-800">{getUserNameById(task.assignedTo)}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold tracking-wide rounded border
                                        ${task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                      {task.status}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 w-8 text-right">{task.progress || 0}%</span>
                                    <button
                                      onClick={() => deleteTask(task._id || task.id)}
                                      className="p-1.5 bg-red-50 text-red-400 hover:text-white hover:bg-red-500 rounded transition-colors"
                                      title="Delete Task Assignment"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
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
    </DashboardLayout >
  );
}
