import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, CheckCircle, Clock, IndianRupee } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SalaryManagement() {
  const { salaries, users, addSalary, updateSalary, deleteSalary } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ userId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const staffAndVolunteers = users.filter(u => u.role === 'staff' || u.role === 'volunteer');

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedUser = users.find(u => (u._id || u.id) === formData.userId);
    if (!selectedUser) return;
    addSalary({
      userId: formData.userId,
      userName: selectedUser.name,
      role: selectedUser.role,
      amount: Number(formData.amount),
      month: Number(formData.month),
      year: Number(formData.year),
      status: 'Pending'
    });
    setFormData({ userId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    setShowForm(false);
  };

  const handleMarkPaid = (id) => {
    updateSalary(id, { status: 'Paid', paidDate: new Date().toISOString().split('T')[0] });
  };

  const totalPending = salaries.filter(s => s.status === 'Pending').reduce((sum, s) => sum + Number(s.amount), 0);
  const totalPaid = salaries.filter(s => s.status === 'Paid').reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Salary Management</h2>
            <p className="text-sm text-gray-500">Track and manage staff and volunteer compensation.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={18} className="mr-2" />
            Add Salary Record
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-100">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-green-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-orange-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-900">₹{totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-blue-600">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">{salaries.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="border-primary-100 bg-primary-50/30">
            <CardHeader>
              <CardTitle>New Salary Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">Select Staff/Volunteer</option>
                    {staffAndVolunteers.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 15000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    required
                    type="number"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit">Create Record</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Salary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salaries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                        <IndianRupee size={40} className="mx-auto mb-3 text-gray-300" />
                        No salary records yet.
                      </td>
                    </tr>
                  ) : (
                    salaries.map(s => {
                      const sId = s._id || s.id;
                      return (
                        <tr key={sId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{s.userName}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${s.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {s.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{MONTHS[s.month - 1]} {s.year}</td>
                          <td className="px-6 py-4 font-bold">₹{Number(s.amount).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {s.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {s.status === 'Pending' && (
                                <button
                                  onClick={() => handleMarkPaid(sId)}
                                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button
                                onClick={() => deleteSalary(sId)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
