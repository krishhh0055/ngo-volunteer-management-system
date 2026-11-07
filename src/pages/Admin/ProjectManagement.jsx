import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';
import { exportToExcel } from '../../lib/excel';
import { Download } from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export default function ProjectManagement() {
  const { projects, addProject, updateProject, deleteProject, addTask, users } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    status: 'Planning',
    priority: 'Medium',
    endDate: ''
  });

  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = p.title ? p.title.toLowerCase().includes(searchLower) : false;
    const statusMatch = p.status ? p.status.toLowerCase().includes(searchLower) : false;
    return titleMatch || statusMatch;
  });

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      budget: project.budget,
      status: project.status,
      priority: project.priority || 'Medium',
      endDate: project.endDate,
      assignedStaff: project.assignedStaff || []
    });
    setEditingId(project._id || project.id);
    setIsCreating(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateProject(editingId, formData);
    } else {
      addProject({
        ...formData,
        raised: 0,
        assignedStaff: formData.assignedStaff || [],
        progress: 0
      });

      // Auto-assign task to the manager
      if (formData.assignedStaff && formData.assignedStaff.length > 0) {
        addTask({
          title: `Manage Project: ${formData.title}`,
          description: `Oversee execution of ${formData.title}`,
          assignedTo: 'Sarah Staff', // Mapping 'u2' to name for now as per mock data pattern
          priority: 'High',
          deadline: formData.endDate,
          projectId: null // General management task
        });
      }
    }
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', description: '', budget: '', status: 'Planning', priority: 'Medium', endDate: '' });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToExcel(projects, 'Projects_Report')}>
              <Download size={18} className="mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsCreating(!isCreating)}>
              <Plus size={18} className="mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {isCreating && (
          <Card className="border-primary-100 bg-primary-50/30">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Project' : 'Create New Project'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  label="Budget (₹)"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        status: newStatus,
                        // Clear assigned staff if reverting to Planning
                        assignedStaff: newStatus === 'Planning' ? [] : prev.assignedStaff
                      }));
                    }}
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
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
                <div>
                  <label className={`block text-sm font-medium mb-1 ${formData.status === 'Planning' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Assign Manager
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    value={formData.assignedStaff?.[0] || ''}
                    onChange={(e) => setFormData({ ...formData, assignedStaff: [e.target.value] })}
                    disabled={formData.status === 'Planning'}
                  >
                    <option value="">Select Staff</option>
                    {users.filter(u => u.role === 'staff').map(u => (
                      <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
                    ))}
                  </select>
                  {formData.status === 'Planning' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Staff can only be assigned when project is In Progress.
                    </p>
                  )}
                </div>
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingId(null); setFormData({ title: '', description: '', budget: '', status: 'Planning', priority: 'Medium', endDate: '' }); }} type="button">Cancel</Button>
                  <Button type="submit">{editingId ? 'Update Project' : 'Create Project'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 w-full max-w-sm rounded-md border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Raised</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr key={project._id || project.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{project.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider
                          ${project.priority === 'High' ? 'bg-red-100 text-red-800' :
                            project.priority === 'Low' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'}`}>
                          {project.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {project.assignedStaff && project.assignedStaff.length > 0
                          ? project.assignedStaff.map(id => {
                            const user = users.find(u => u._id === id || u.id === id || u.name === id);
                            return user ? user.name : id;
                          }).join(', ')
                          : <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-4">₹{Number(project.budget).toLocaleString()}</td>
                      <td className="px-6 py-4">₹{Number(project.raised).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{project.progress}%</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          onClick={() => {
                            setDeleteId(project._id || project.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteProject(deleteId)}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
        />
      </div>
    </DashboardLayout>
  );
}
