import { io } from 'socket.io-client';

// One shared socket connection for the whole app
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export default socket;