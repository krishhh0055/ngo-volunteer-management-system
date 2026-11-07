import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { Send, User as UserIcon, MessageCircle } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { users, messages, fetchMessages, sendMessage, markMessageRead } = useData();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Cross-reference mock auth user with real database user to get the correct MongoDB _id
  const dbUser = users.find(u => u.email === user?.email);
  const currentUserId = dbUser?._id || user?._id || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchMessages(currentUserId);
    }
  }, [currentUserId, fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    await sendMessage({
      senderId: currentUserId,
      receiverId: selectedUserId,
      content: newMessage.trim()
    });
    setNewMessage('');
    fetchMessages(currentUserId); // Refresh to get the latest instantly
  };

  const otherUsers = users.filter(u => (u._id || u.id) !== currentUserId);
  const selectedUser = users.find(u => (u._id || u.id) === selectedUserId);

  const conversation = messages.filter(
    m => (m.senderId === currentUserId && m.receiverId === selectedUserId) ||
         (m.senderId === selectedUserId && m.receiverId === currentUserId)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Mark unread messages as read when viewing conversation
  useEffect(() => {
    if (selectedUserId) {
      const unread = conversation.filter(m => m.receiverId === currentUserId && !m.read);
      unread.forEach(m => markMessageRead(m._id || m.id));
    }
  }, [selectedUserId, conversation, currentUserId, markMessageRead]);

  return (
    <DashboardLayout role={user?.role || 'admin'}>
      <div className="flex bg-white h-[calc(100vh-8rem)] rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Users List */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {otherUsers.map(u => {
              const uId = u._id || u.id;
              // Check for unread messages from this user
              const hasUnread = messages.some(m => m.senderId === uId && m.receiverId === currentUserId && !m.read);
              return (
                <button
                  key={uId}
                  onClick={() => setSelectedUserId(uId)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-gray-50
                    ${selectedUserId === uId ? 'bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <UserIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{u.role}</p>
                  </div>
                  {hasUnread && (
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{selectedUser?.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{selectedUser?.role}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">No messages yet. Start a conversation!</div>
                ) : (
                  conversation.map(msg => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div key={msg._id || msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 ${
                          isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border-gray-300 border focus:border-primary-500 focus:ring-primary-500 px-4 py-2"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageCircle size={48} className="text-gray-300 mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
