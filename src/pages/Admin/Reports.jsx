import { FileBarChart, Download, DollarSign, Users, Briefcase } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { exportToExcel } from '../../lib/excel';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Reports() {
  const { projects, funds, tasks } = useData();

  // Calculate Data for Charts
  const statusCounts = projects.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const reports = [
    {
      title: 'Financial Report',
      description: 'Detailed analysis of donations, expenditures, and available funds.',
      icon: DollarSign,
      action: () => exportToExcel(funds.recentDonations, 'Financial_Report')
    },
    {
      title: 'Project Activity',
      description: 'Status updates and progress reports for all active projects.',
      icon: Briefcase,
      action: () => exportToExcel(projects, 'Projects_Activity_Report')
    },
    {
      title: 'Volunteer Performance',
      description: 'Task completion rates and volunteer engagement metrics.',
      icon: Users,
      action: () => exportToExcel(tasks, 'Volunteer_Performance_Report')
    }
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports Center</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Total Projects</span>
                  <span className="font-bold text-lg">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Avg. Project Completion</span>
                  <span className="font-bold text-lg">
                    {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Tasks Completed</span>
                  <span className="font-bold text-lg">
                    {tasks.filter(t => t.status === 'Completed').length} / {tasks.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Funds Goal Reached</span>
                  <span className="font-bold text-lg">
                    {Math.round((funds.totalRaised / funds.target) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mt-8">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <Icon className="text-primary-600" size={24} />
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mt-4 mb-2">{report.title}</h4>
                  <p className="text-gray-500 text-sm mb-4 h-10">{report.description}</p>
                  <Button variant="outline" className="w-full" onClick={report.action}>
                    <Download size={16} className="mr-2" />
                    Download CSV
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
