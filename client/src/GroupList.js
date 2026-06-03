import React, { useEffect, useState } from 'react';
import $ from 'jquery';

function GroupList({ user, onSelectGroup, selectedGroupId, onShowMyFeed }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const token = user?.token || localStorage.getItem('token');

  const fetchGroups = () => {
    if (!token) return;
    $.ajax({
      url: 'http://localhost:5001/api/groups',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setGroups(data),
      error: (err) => console.error("Error fetching groups", err)
    });
  };

  useEffect(() => {
    if (token) fetchGroups();
  }, [token]);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    $.ajax({
      url: 'http://localhost:5001/api/groups',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ name: newGroupName }), 
      success: (data) => {
        setNewGroupName("");
        setGroups([data, ...groups]);
      }
    });
  };

  return (
    
    <div style={{ width: '280px', height: '100vh', background: '#ffffff', borderRight: '1px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <button 
        onClick={onShowMyFeed} 
        style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
        My Personal Feed
      </button>
      <h3 style={{ color: '#333', marginBottom: '20px', fontWeight: '700' }}>My Groups</h3>
      <form onSubmit={handleCreateGroup} style={{ marginBottom: '25px' }}>
        <input 
          placeholder="New Group Name..." 
          value={newGroupName} 
          onChange={e => setNewGroupName(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Create Group</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {groups.map(g => (
          <div key={g._id} onClick={() => onSelectGroup(g)} style={{ padding: '12px', background: selectedGroupId === g._id ? '#e7f1ff' : '#f8f9fa', borderRadius: '8px', cursor: 'pointer', border: selectedGroupId === g._id ? '1px solid #007bff' : '1px solid transparent', transition: '0.2s', fontWeight: selectedGroupId === g._id ? '600' : '400' }}>
            👥 {g.name}
          </div>
        ))}
      </div>
    </div>
  );
}
export default GroupList;