import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Calendar, MapPin, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function Events({ role }) {
  const { user } = useAuth();
  const { events, addEvent, registerForEvent, deleteEvent } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'Other' });

  const isAdmin = role === 'admin';
  const currentUserId = user?._id || user?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addEvent(formData);
    setFormData({ title: '', description: '', date: '', location: '', type: 'Other' });
    setShowForm(false);
  };

  const handleRegister = async (eventId) => {
    if (currentUserId) {
      await registerForEvent(eventId, currentUserId);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events & Campaigns</h1>
            <p className="text-sm text-gray-500">Discover and register for upcoming NGO activities.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Event
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Create an Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <select
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Fundraiser">Fundraiser</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Drive">Drive</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    Create Event
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No upcoming events.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            events.map((event) => {
              const eId = event._id || event.id;
              const isRegistered = event.registrants?.includes(currentUserId);
              
              return (
                <Card key={eId} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="h-2 bg-primary-500 w-full rounded-t-xl"></div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                        {event.type}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteEvent(eId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users size={16} className="text-primary-500" />
                          <span>{event.registrants?.length || 0} registered</span>
                        </div>
                        {!isAdmin && (
                          <button
                            onClick={() => !isRegistered && handleRegister(eId)}
                            disabled={isRegistered}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                              ${isRegistered ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                          >
                            {isRegistered ? <><CheckCircle2 size={16} /> Registered</> : 'Register'}
                          </button>
                        )}
                      </div>
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
