import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../socket/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // On first load, check if we already have a valid token and fetch the real user
  useEffect(() => {
    const token = localStorage.getItem('ia_perma_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        socket.connect();
        socket.emit('register', res.data.user.id);
      })
      .catch(() => {
        localStorage.removeItem('ia_perma_token');
        localStorage.removeItem('ia_perma_user');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Listen for global online/offline events, independent of which chat is open
  useEffect(() => {
    const handleOnline = (userId) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    };
    const handleOffline = (userId) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };
    const handleList = (ids) => {
      setOnlineUserIds(new Set(ids));
    };

    socket.on('userOnline', handleOnline);
    socket.on('userOffline', handleOffline);
    socket.on('onlineUsersList', handleList);
    socket.emit('getOnlineUsers');

    return () => {
      socket.off('userOnline', handleOnline);
      socket.off('userOffline', handleOffline);
      socket.off('onlineUsersList', handleList);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('ia_perma_token', token);
    localStorage.setItem('ia_perma_user', JSON.stringify(userData));
    setUser(userData);
    socket.connect();
    socket.emit('register', userData.id);
  };

  const logout = () => {
    localStorage.removeItem('ia_perma_token');
    localStorage.removeItem('ia_perma_user');
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, onlineUserIds }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can easily access auth data:
// const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}