import React, { useEffect, useState } from 'react';
import socket from './socket'; // הקובץ שיצרנו קודם
import $ from 'jquery';

function Chat({ groupId, user }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

 useEffect(() => {
    if (groupId) {
        // שליפת ההיסטוריה מהשרת בעזרת jQuery $.ajax כפי שנדרש בדרישות
        $.ajax({
            url: `http://localhost:5001/api/messages/${groupId}`,
            method: 'GET',
            success: (data) => {
                setChat(data); // עדכון הסטייט עם כל ההודעות הישנות
            },
            error: (err) => console.error("Could not fetch history", err)
        });

        socket.emit('join_group', groupId);
    }
}, [groupId]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
        setChat((prev) => [...prev, data]); // הוספת ההודעה החדשה לסוף הרשימה
    });
    return () => socket.off('receive_message');
    }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send_message', { groupId, text: message, sender: user.username });
    setMessage("");
  };

  return (
    <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '15px', 
        maxWidth: '500px', 
        margin: '20px auto',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
        }}>
        <h3 style={{ textAlign: 'center', color: '#333' }}>Group Chat</h3>
        
        <div style={{ 
            height: '350px', 
            overflowY: 'auto', 
            border: 'none', 
            padding: '15px', 
            marginBottom: '15px',
            background: 'white',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {chat.map((msg, i) => (
            <div key={i} style={{ 
                padding: '8px 12px', 
                borderRadius: '15px', 
                backgroundColor: msg.sender === user.username ? '#d1e7dd' : '#e9ecef',
                alignSelf: msg.sender === user.username ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
            }}>
                <strong>{msg.sender}:</strong> {msg.text}
            </div>
            ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyPress={(e) => { if (e.key === 'Enter') sendMessage();}}
            placeholder="Type a message..." 
            />
            <button onClick={sendMessage} style={{ 
            padding: '10px 20px', 
            backgroundColor: '#9370DB', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer' 
            }}>Send</button>
        </div>
        </div>
  );
}
export default Chat;