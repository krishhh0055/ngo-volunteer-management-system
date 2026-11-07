import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { CalendarDays, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

export default function LeaveHub({ role }) {
  const { user } = useAuth();
  const { leaveRequests, addLeaveRequest, updateLeaveStatus, users } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });

  const isAdmin = role === 'admin';
  // Cross-reference mock auth user with real database user to get the correct MongoDB _id
  const dbUser = users.find(u => u.email === user?.email);
  const currentUserId = dbUser?._id || user?._id || user?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addLeaveRequest({
      ...formData,
      userId: currentUserId,
      userName: user?.name,
    });
    setFormData({ startDate: '', endDate: '', reason: '' });
    setShowForm(false);
  };

  const handleStatusUpdate = async (id, status) => {
    await updateLeaveStatus(id, status);
  };

  const statusIcons = {
    Pending: <Clock size={16} className="text-yellow-600" />,
    Approved: <CheckCircle size={16} className="text-green-600" />,
    Rejected: <XCircle size={16} className="text-red-600" />
  };

  const statusColors = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200'
  };

  // Filter requests depending on role
  const displayedRequests = isAdmin 
    ? leaveRequests 
    : leaveRequests.filter(req => req.userId === currentUserId || req.userId === user?.id);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Leave Approvals' : 'Leave Management'}</h1>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Review and manage staff leave requests.' : 'Apply for leaves and check approval status.'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Apply for Leave
            </button>
          )}
        </div>

        {showForm && !isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      required
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      required
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {displayedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <CalendarDays size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No leave requests found.</p>
              </CardContent>
            </Card>
          ) : (
            displayedRequests.map((req) => {
              const rId = req._id || req.id;
              return (
                <Card key={rId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {isAdmin && <h3 className="font-bold text-gray-900">{req.userName}</h3>}
                          {!isAdmin && <h3 className="font-bold text-gray-900">Your Leave Request</h3>}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[req.status]}`}>
                            {statusIcons[req.status]}
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <CalendarDays size={16} />
                          <span>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 italic">"{req.reason}"</p>
                      </div>

                      {isAdmin && req.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(rId, 'Approved')}
                            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(rId, 'Rejected')}
                            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
