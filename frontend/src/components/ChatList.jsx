import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import NewChatModal from './NewChatModal';
import NewGroupModal from './NewGroupModal';
import { Users } from 'lucide-react';

export default function ChatList({ activeConversationId, onSelectConversation }) {
  const { user, onlineUserIds } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchConversations = () => {
    api.get('/conversations')
      .then((res) => setConversations(res.data.conversations))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

const handleStartedChat = (conversation) => {
    setShowNewChat(false);
    fetchConversations();
    onSelectConversation(conversation.id, conversation);
  };
const handleCreatedGroup = (conversation) => {
    setShowNewGroup(false);
    fetchConversations();
    onSelectConversation(conversation.id, conversation);
  };
  const getOtherParticipant = (conv) => {
    return conv.participants.find((p) => p.user.id !== user.id)?.user;
  };

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
<div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 relative">
        <h2 className="font-semibold text-slate-900">Chats</h2>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Plus size={17} />
        </button>

        {showMenu && (
          <div className="absolute right-4 top-14 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-48 z-10">
            <button
              onClick={() => { setShowMenu(false); setShowNewChat(true); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Plus size={15} /> New chat
            </button>
            <button
              onClick={() => { setShowMenu(false); setShowNewGroup(true); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Users size={15} /> New group
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-sm text-slate-400 px-4 py-6 text-center">Loading conversations...</p>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-center px-6 py-10">
            <p className="text-sm text-slate-500 mb-1">No conversations yet</p>
            <p className="text-xs text-slate-400">Click the + button to message a colleague</p>
          </div>
        )}

        {conversations.map((conv) => {
          const other = conv.isGroup ? null : getOtherParticipant(conv);
          const displayName = conv.isGroup ? conv.groupName : other?.fullName;
          const lastMessage = conv.messages?.[0];
          const isActive = conv.id === activeConversationId;

          return (
           <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id, conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 text-left transition-colors
                ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
            >
<div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold
                  ${conv.isGroup ? 'bg-secondary' : 'bg-primary'}`}>
                  {conv.isGroup ? <Users size={18} /> : initials(displayName)}
                </div>
                {!conv.isGroup && onlineUserIds.has(other?.id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent border-2 border-white"></span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{displayName || 'Unknown'}</p>
                <p className="text-xs text-slate-400 truncate">
                  {lastMessage ? lastMessage.content : 'No messages yet'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} onStarted={handleStartedChat} />
      )}
      {showNewGroup && (
        <NewGroupModal onClose={() => setShowNewGroup(false)} onCreated={handleCreatedGroup} />
      )}
    </div>
  );
}