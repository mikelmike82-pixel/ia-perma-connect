import { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare, Paperclip, FileText, X, Download } from 'lucide-react';
import api from '../api/axios';
import socket from '../socket/socket';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({ conversationId, conversation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    api.get(`/conversations/${conversationId}/messages`)
      .then((res) => setMessages(res.data.messages))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
// Join this conversation's real-time "room"
    socket.emit('joinConversation', conversationId);

    // If the socket reconnects (e.g. after the phone was backgrounded or lost signal),
    // re-join the room and re-fetch messages in case anything was missed
    const handleReconnect = () => {
      socket.emit('joinConversation', conversationId);
      api.get(`/conversations/${conversationId}/messages`)
        .then((res) => setMessages(res.data.messages))
        .catch((err) => console.error(err));
    };
    socket.on('connect', handleReconnect);

    // Listen for new messages arriving live
    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    const handleUserTyping = ({ conversationId: cid, userId }) => {
      if (cid === conversationId && userId !== user.id) {
        setOthersTyping(true);
      }
    };
    const handleUserStoppedTyping = ({ conversationId: cid, userId }) => {
      if (cid === conversationId && userId !== user.id) {
        setOthersTyping(false);
      }
    };

    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    // Cleanup when switching conversations or unmounting
return () => {
      socket.emit('leaveConversation', conversationId);
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('connect', handleReconnect);
      setOthersTyping(false);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null); // no image preview for documents
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('conversationId', conversationId);
    if (text.trim()) formData.append('caption', text.trim());

    try {
      await api.post('/conversations/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearSelectedFile();
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    const content = text;
    setText('');

    try {
      // We no longer manually add the message here - it will arrive
      // via the 'newMessage' socket event instead, for both sender and receiver
      await api.post(`/conversations/${conversationId}/messages`, { content });
    } catch (err) {
      console.error(err);
      setText(content);
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
        <MessageSquare size={40} strokeWidth={1.5} className="mb-3" />
        <p className="text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

const headerName = conversation?.isGroup
    ? conversation.groupName
    : conversation?.participants?.find((p) => p.user.id !== user.id)?.user?.fullName;

  const headerSubtitle = conversation?.isGroup
    ? `${conversation.participants?.length || 0} members`
    : 'Private conversation';

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {conversation && (
        <div className="h-16 border-b border-slate-200 flex items-center px-6 shrink-0">
          <p className="text-sm font-semibold text-slate-800">{headerName}</p>
          <span className="text-xs text-slate-400 ml-2">· {headerSubtitle}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {loading && <p className="text-sm text-slate-400 text-center">Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-10">No messages yet — say hello 👋</p>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;
          const fileName = msg.fileUrl?.split('/').pop();

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>

                {/* Image message */}
                {msg.fileType === 'image' && (
                 <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={msg.fileUrl}
                      alt="Shared image"
                      className="rounded-2xl max-w-[280px] max-h-72 object-cover mb-1 border border-slate-200"
                    />
                  </a>
                )}

                {/* Document message */}
                {msg.fileType === 'document' && (
                  <a
                   href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 border
                      ${isMine ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-200'}`}
                  >
                    <FileText size={22} className="text-primary shrink-0" />
                    <span className="text-sm text-slate-700 truncate max-w-[180px]">{fileName}</span>
                    <Download size={15} className="text-slate-400 shrink-0" />
                  </a>
                )}

{/* Text content / caption */}
                {msg.content && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${isMine
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                      }`}
                  >
                    {msg.content}
                  </div>
                )}

                <span className="text-[11px] text-slate-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {othersTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200">
        {/* Selected file preview, shown above the input before sending */}
        {selectedFile && (
          <div className="px-4 pt-3 flex items-center gap-3">
            <div className="relative">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <FileText size={22} className="text-slate-400" />
                </div>
              )}
              <button
                onClick={clearSelectedFile}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {uploading ? 'Sending...' : 'Send file'}
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors shrink-0"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              socket.emit('typing', { conversationId, userId: user.id, userName: user.fullName });

              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', { conversationId, userId: user.id });
              }, 1500);
            }}
            placeholder={selectedFile ? 'Add a caption (optional)...' : 'Type a message...'}
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={sending || !text.trim() || selectedFile}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}