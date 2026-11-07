import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, Mail } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || 'email@example.com',
    bio: 'Dedicated impact maker.',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    updates: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
    // In a real app, update AuthContext and Backend here
  };

  return (
    <DashboardLayout role={user?.role || 'admin'}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar / Tabs */}
          <Card className="md:col-span-1 h-fit">
            <CardContent className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={18} /> Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Bell size={18} /> Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Shield size={18} /> Security
              </button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700">
                        {profile.name.charAt(0)}
                      </div>
                      <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                    </div>

                    <Input
                      label="Full Name"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border h-24"
                        value={profile.bio}
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Bell className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-xs text-gray-500">Receive real-time alerts in browser</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifications.sms} onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Shield className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">Project Updates</p>
                          <p className="text-xs text-gray-500">Get notified when projects change</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifications.updates} onChange={() => setNotifications({ ...notifications, updates: !notifications.updates })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                    />

                    <div className="flex justify-end pt-4">
                      <Button variant="destructive">Update Password</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
