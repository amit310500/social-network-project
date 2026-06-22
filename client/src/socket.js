import io from 'socket.io-client';

// Connect to the backend server using Socket.io
// Ensure the port (5001) matches the one configured on your server
const socket = io('http://localhost:5001');

export default socket;