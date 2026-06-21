import React, { useEffect, useState } from 'react';
import socket from './socket'; // הקובץ שיצרנו קודם

function Chat({ groupId, user }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    if (groupId) {
      socket.emit('join_group', groupId);
      setChat([]); // ניקוי צ'אט במעבר קבוצה
    }
  }, [groupId]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChat((prev) => [...prev, data]);
    });
    return () => socket.off('receive_message');
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send_message', { groupId, text: message, sender: user.username });
    setMessage("");
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
      <h3>Group Chat</h3>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
        {chat.map((msg, i) => <p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>)}
      </div>
      <input value={message} onChange={e => setMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') sendMessage();}}/>
      {/*<button onClick={sendMessage}>Send</button>*/} 
    </div>
  );
}
export default Chat;