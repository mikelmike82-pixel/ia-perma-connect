import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const handleSelectConversation = (id, conversation) => {
    setActiveConversationId(id);
    setActiveConversation(conversation || null);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 flex overflow-hidden pb-16 sm:pb-0">
          <div className={`${activeConversationId ? 'hidden sm:flex' : 'flex'} sm:flex`}>
            <ChatList
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <div className={`${activeConversationId ? 'flex' : 'hidden sm:flex'} flex-1`}>
            <ChatWindow conversationId={activeConversationId} conversation={activeConversation} />
          </div>
        </main>
      </div>
    </div>
  );
}