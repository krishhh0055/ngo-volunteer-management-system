import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';

import { useAuth } from '../../context/AuthContext';

export default function VolunteerDashboard() {
  const { tasks, updateTask, users } = useData();
  const { user } = useAuth();

  const dbUser = users.find(u => u.email === user?.email) || user;
  const myTasks = tasks.filter(t => t.assignedTo === dbUser?.name || t.assignedTo === dbUser?.id || t.assignedTo === dbUser?._id);

  const calculateDaysLeft = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateString);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <DashboardLayout role="volunteer">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'Volunteer'}</h2>

        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">{myTasks.filter(t => t.status === 'Completed').length}</p>
                <p className="text-xs text-purple-600 uppercase font-semibold">Tasks Completed</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {myTasks.filter(t => t.status === 'Completed').length * 2}
                </p>
                <p className="text-xs text-orange-600 uppercase font-semibold">Est. Hours Contributed</p>
              </div>
            </div>

            {myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks.map(task => (
                  <div key={task.id} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                      <span>Due Date: {task.deadline || task.dueDate || 'No Date'}</span>
                      <span className={`font-semibold ${task.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{task.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                    {task.status !== 'Completed' && (task.deadline || task.dueDate) && (
                      <div className="mt-3 flex justify-end">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${calculateDaysLeft(task.deadline || task.dueDate) < 0
                          ? 'bg-red-100 text-red-700'
                          : calculateDaysLeft(task.deadline || task.dueDate) <= 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {calculateDaysLeft(task.deadline || task.dueDate) < 0
                            ? `${Math.abs(calculateDaysLeft(task.deadline || task.dueDate))} Days Overdue`
                            : calculateDaysLeft(task.deadline || task.dueDate) === 0
                              ? 'Due Today'
                              : `${calculateDaysLeft(task.deadline || task.dueDate)} Days Left`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No tasks assigned yet. Good job!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
