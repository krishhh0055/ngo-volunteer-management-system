import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Banknote,
  FileBarChart,
  ClipboardList,
  LogOut,
  Settings,
  MessageCircle,
  Megaphone,
  Calendar,
  CalendarDays,
  Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ role = 'admin' }) {
  const location = useLocation();

  const menus = {
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
      { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList },
      { name: 'Events', path: '/admin/events', icon: Calendar },
      { name: 'Messages', path: '/admin/messages', icon: MessageCircle },
      { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
      { name: 'Leave Hub', path: '/admin/leaves', icon: CalendarDays },
      { name: 'Salary', path: '/admin/salary', icon: Wallet },
      { name: 'Finance', path: '/admin/finance', icon: Banknote },
      { name: 'Staff & Volunteers', path: '/admin/users', icon: Users },
      { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
    ],
    staff: [
      { name: 'Dashboard', path: '/staff', icon: LayoutDashboard },
      { name: 'My Projects', path: '/staff/projects', icon: FolderKanban },
      { name: 'Tasks', path: '/staff/tasks', icon: ClipboardList },
      { name: 'Events', path: '/staff/events', icon: Calendar },
      { name: 'Messages', path: '/staff/messages', icon: MessageCircle },
      { name: 'Announcements', path: '/staff/announcements', icon: Megaphone },
      { name: 'Leave Hub', path: '/staff/leaves', icon: CalendarDays },
    ],
    volunteer: [
      { name: 'Dashboard', path: '/volunteer', icon: LayoutDashboard },
      { name: 'My Tasks', path: '/volunteer/tasks', icon: ClipboardList },
      { name: 'Events', path: '/volunteer/events', icon: Calendar },
      { name: 'Messages', path: '/volunteer/messages', icon: MessageCircle },
      { name: 'Announcements', path: '/volunteer/announcements', icon: Megaphone },
      { name: 'Leave Hub', path: '/volunteer/leaves', icon: CalendarDays },
    ],
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentMenu = menus[role] || menus.admin;

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 text-primary-700 font-bold text-2xl">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            N
          </div>
          NGO<span className="text-secondary-600">VMS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings size={20} className="text-gray-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}
