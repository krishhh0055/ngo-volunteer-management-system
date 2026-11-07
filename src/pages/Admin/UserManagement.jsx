import { useState } from 'react';
import { Search, Mail, Shield, Trash2, Download, UserX, UserCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export default function UserManagement() {
  const { users, addUser, deleteUser, tasks, updateUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'volunteer', volunteerType: 'Permanent', associatedEvent: '' });
  
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();
    const payload = { 
      ...newUser, 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    
    if (payload.role !== 'volunteer') {
      delete payload.volunteerType;
      delete payload.associatedEvent;
    }
    if (payload.volunteerType !== 'Event-Specific') {
      delete payload.associatedEvent;
    }

    addUser(payload);
    setIsAdding(false);
    setNewUser({ name: '', email: '', role: 'volunteer', volunteerType: 'Permanent', associatedEvent: '' });
  };

  const executeToggleStatus = () => {
    if (!statusConfirmUser) return;
    const isCurrentActive = statusConfirmUser.status === 'Active' || !statusConfirmUser.status;
    const newStatus = isCurrentActive ? 'Left' : 'Active';
    const payload = { status: newStatus };
    
    if (newStatus === 'Left') {
      payload.leaveDate = new Date().toISOString().split('T')[0];
    } else {
      payload.leaveDate = ''; 
    }

    updateUser(statusConfirmUser.id || statusConfirmUser._id, payload);
    setIsStatusModalOpen(false);
    setStatusConfirmUser(null);
  };

  const exportToSheets = () => {
    const sheetData = users.map(u => {
      const userTasks = tasks.filter(t => t.assignedTo === u.id || t.assignedTo === u._id || t.assignedTo === u.name);
      const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
      
      return {
        'Name': u.name,
        'Email': u.email,
        'System Role': u.role.charAt(0).toUpperCase() + u.role.slice(1),
        'Volunteer Category': u.role === 'volunteer' ? (u.volunteerType || 'Permanent') : 'N/A',
        'Specific Event': u.role === 'volunteer' && u.associatedEvent ? u.associatedEvent : 'N/A',
        'Status': u.status || 'Active',
        'Join Date': u.joinDate || 'Priorly Registered',
        'Leave Date': u.status === 'Left' ? (u.leaveDate || 'Unknown') : 'N/A',
        'Total Tasks Assigned': userTasks.length,
        'Tasks Completed': completedTasks,
        'Activity Progress': userTasks.length > 0 ? `${Math.round((completedTasks/userTasks.length)*100)}%` : '0%'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteer & Staff Register");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `NGO_Volunteer_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Staff & Volunteers</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToSheets} className="border-green-600 text-green-700 hover:bg-green-50">
              <Download size={18} className="mr-2" />
              Export to Google Sheets
            </Button>
            <Button onClick={() => setIsAdding(!isAdding)}>Invite User</Button>
          </div>
        </div>

        {isAdding && (
          <Card className="mb-6 border-blue-100 bg-blue-50/30">
            <CardHeader><CardTitle>Invite New User</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value.toLowerCase() })}
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {newUser.role === 'volunteer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Category</label>
                      <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        value={newUser.volunteerType}
                        onChange={e => setNewUser({ ...newUser, volunteerType: e.target.value })}
                      >
                        <option>Permanent</option>
                        <option>Temporary</option>
                        <option>Event-Specific</option>
                      </select>
                    </div>
                    {newUser.volunteerType === 'Event-Specific' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Associated Event</label>
                        <input
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          value={newUser.associatedEvent}
                          onChange={e => setNewUser({ ...newUser, associatedEvent: e.target.value })}
                          placeholder="e.g. Earth Day Beach Clean-up"
                          required
                        />
                      </div>
                    )}
                  </>
                )}
                
                <div className="md:col-span-3 flex justify-end mt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="mr-2">Cancel</Button>
                  <Button type="submit">Send Invite</Button>
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
                placeholder="Search users..."
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
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role / Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id || user._id} className={`hover:bg-gray-50/50 transition-colors ${user.status === 'Left' ? 'opacity-60 bg-gray-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.name} className={`h-10 w-10 rounded-full bg-gray-200 ${user.status === 'Left' ? 'grayscale' : ''}`} />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <div className="flex items-center text-xs text-gray-500 gap-1 mt-0.5">
                              <Mail size={12} /> {user.email}
                            </div>
                            {user.joinDate && <div className="text-[10px] text-gray-400 mt-0.5">Joined: {user.joinDate}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-2 text-gray-700 capitalize">
                            <Shield size={14} className="text-gray-400" />
                            <span className="font-medium">{user.role}</span>
                          </div>
                          {user.role === 'volunteer' && (
                            <span className={`inline-block px-2 py-0.5 mt-1 text-[10px] tracking-wide rounded-full font-bold
                              ${user.volunteerType === 'Permanent' ? 'bg-blue-100 text-blue-800' :
                                user.volunteerType === 'Temporary' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'}`}>
                              {user.volunteerType || 'Permanent'}
                              {user.volunteerType === 'Event-Specific' && ` - ${user.associatedEvent}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (!user.status || user.status === 'Active') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-200 text-gray-800 border border-gray-300'
                          }`}>
                            {user.status || 'Active'}
                          </span>
                          {user.status === 'Left' && user.leaveDate && (
                            <span className="text-[10px] text-gray-500 font-bold ml-1">Exited: {user.leaveDate}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setStatusConfirmUser(user);
                              setIsStatusModalOpen(true);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded ${(!user.status || user.status === 'Active') ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'} transition-colors`}
                            title={(!user.status || user.status === 'Active') ? "Mark as Left (Offboard)" : "Mark as Active"}
                          >
                            {(!user.status || user.status === 'Active') ? <UserX size={14} /> : <UserCheck size={14} />}
                            {(!user.status || user.status === 'Active') ? 'Offboard' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id || user._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Completely Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <ConfirmationModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onConfirm={executeToggleStatus}
          title={(!statusConfirmUser?.status || statusConfirmUser?.status === 'Active') ? "Offboard Volunteer" : "Reactivate Volunteer"}
          message={(!statusConfirmUser?.status || statusConfirmUser?.status === 'Active') 
            ? `Are you sure you want to mark ${statusConfirmUser?.name} as 'Left'? This will record their exit date and mark them inactive.` 
            : `Are you sure you want to reactivate ${statusConfirmUser?.name}?`}
        />
      </div>
    </DashboardLayout>
  );
}
