import io from 'socket.io-client';

// התחברות לשרת (וודאי שהפורט 5001 תואם למה שמוגדר בשרת שלך)
const socket = io('http://localhost:5001');

export default socket;