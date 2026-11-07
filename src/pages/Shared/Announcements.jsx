import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

export default function Announcements({ role }) {
  const { user } = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'Normal' });

  const isAdmin = role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addAnnouncement({
      ...formData,
      author: user?.name || 'Admin',
    });
    setFormData({ title: '', content: '', priority: 'Normal' });
    setShowForm(false);
  };

  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Normal: 'bg-blue-100 text-blue-700 border-blue-200',
    Low: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500">Stay updated with the latest news and policies.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Announcement
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Post an Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="High">High</option>
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                    Post
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No announcements right now.</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement._id || announcement.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  announcement.priority === 'High' ? 'bg-red-500' :
                  announcement.priority === 'Normal' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[announcement.priority]}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Posted by <span className="font-medium text-gray-700">{announcement.author}</span> on {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteAnnouncement(announcement._id || announcement.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Delete Announcement"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
