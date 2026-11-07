import { useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer() {
  const { notifications, markNotificationRead, users } = useData();
  const { user } = useAuth();

  // Cross-reference mock local user with real database user ID
  const realUser = users.find(u => u.email === user?.email);
  const currentUserId = realUser?._id || realUser?.id || user?._id || user?.id;
  const currentUserName = user?.name || realUser?.name;

  // Filter notifications for the current user or system-wide (if no userId)
  // And only show unread ones
  const activeNotifications = notifications.filter(n =>
    (!n.userId || n.userId === currentUserName || n.userId === currentUserId) && !n.read
  ).slice(0, 5); // Limit to 5 at a time

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (activeNotifications.length > 0) {
      const timer = setTimeout(() => {
        markNotificationRead(activeNotifications[0]._id || activeNotifications[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeNotifications, markNotificationRead]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {activeNotifications.map(notification => (
          <motion.div
            key={notification._id || notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 w-80 pointer-events-auto flex gap-3 relative overflow-hidden"
          >
            {/* Status Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              }`} />

            <div className={`mt-0.5 ${notification.type === 'success' ? 'text-green-600' :
              notification.type === 'error' ? 'text-red-600' :
                'text-blue-600'
              }`}>
              {notification.type === 'success' ? <CheckCircle size={18} /> :
                notification.type === 'error' ? <AlertCircle size={18} /> :
                  <Info size={18} />}
            </div>

            <div className="flex-1 pr-6">
              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(notification.date).toLocaleDateString()}</p>
            </div>

            <button
              onClick={() => markNotificationRead(notification._id || notification.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
