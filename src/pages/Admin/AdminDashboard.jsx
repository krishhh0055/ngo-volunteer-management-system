import { Banknote, Users, FolderKanban, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { useData } from '../../context/DataContext';

export default function AdminDashboard() {
  const { projects, funds, tasks, users } = useData();

  const volunteerCount = users.filter(u => u.role === 'volunteer').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  const stats = [
    {
      title: 'Total Funds Raised',
      value: `₹${funds.totalRaised.toLocaleString()}`,
      change: `Target: ₹${funds.target.toLocaleString()}`,
      icon: Banknote,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'In Progress').length,
      change: `${projects.filter(p => p.status === 'Planning').length} in planning`,
      icon: FolderKanban,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Tasks',
      value: tasks.length,
      change: `${pendingTasks} pending`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Volunteers Active',
      value: volunteerCount,
      change: `${users.filter(u => u.role === 'staff').length} staff members`,
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funds.recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{donation.donor}</p>
                        <p className="text-xs text-gray-500">{donation.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary-700">+₹{donation.amount}</p>
                        <p className="text-xs text-gray-400">{donation.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
