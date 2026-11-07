import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../ui/ToastContainer';

export function DashboardLayout({ children, role = 'admin' }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 pl-64">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {role}
              </p>
            </div>

            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full bg-gray-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                {user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
