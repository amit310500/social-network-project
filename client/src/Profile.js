import React, { useState, useEffect } from 'react';
import $ from 'jquery';

function Profile({ user, onLogout }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]); // כל פעם שהאובייקט user משתנה, השדות מתעדכנים

  const handleUpdate = () => {
    const token = localStorage.getItem('token');
    $.ajax({
      url: `http://localhost:5001/api/users/${user._id}`,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ username, email }),
      success: (data) => {
        alert("Profile updated successfully!");
        // אפשר כאן לעדכן גם את ה-State של המשתמש באפליקציה אם צריך
      },
      error: (err) => alert("Update failed: " + err.responseText)
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      const token = localStorage.getItem('token');
      $.ajax({
        url: `http://localhost:5001/api/users/${user._id}`,
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
        success: () => {
          alert("Account deleted.");
          localStorage.removeItem('token'); // ניקוי ה-Token
          if (onLogout) onLogout(); // הפניה לדף התחברות
        },
        error: (err) => alert("Delete failed: " + err.responseText)
      });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>Edit Profile</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>Username:</label>
        <input style={{ width: '100%', padding: '8px' }} value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input style={{ width: '100%', padding: '8px' }} value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleUpdate} style={{ flex: 1, padding: '10px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '6px' }}>Save Changes</button>
        <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px' }}>Delete Account</button>
      </div>
    </div>
  );
}

export default Profile;