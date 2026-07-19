import { io } from 'socket.io-client';

// One shared socket connection for the whole app
const socket = io('http://localhost:5000', {
  autoConnect: false, // we'll manually connect once the user is logged in
});

export default socket;