import React, { useEffect, useState } from 'react';
import $ from 'jquery';

function GroupList({ user, onSelectGroup, selectedGroupId, onShowMyFeed }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const token = user?.token || localStorage.getItem('token');

  // פונקציה למשיכת הקבוצות
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

  // פונקציה ליצירת קבוצה
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
        fetchGroups();
        onSelectGroup(data);
      }
    });
  };

  // פונקציה למחיקת קבוצה
  const deleteGroup = (groupId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this group?");
    if (isConfirmed) {
        $.ajax({
            url: `http://localhost:5001/api/groups/${groupId}`,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token },
            success: () => {
                setGroups(groups.filter(g => g._id !== groupId));
            },
            error: (err) => {
                console.error("Error deleting group", err);
                alert("You are not authorized to delete this group.");
            }
        });
    }
  };

  const handleEditGroupName = (groupId, currentName) => {
    const newName = prompt("Enter new group name:", currentName);
    // בדיקה שהשם שונה ולא ריק
    if (!newName || newName === currentName || !newName.trim()) return;

    $.ajax({
      url: `http://localhost:5001/api/groups/${groupId}`,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ name: newName }),
      success: () => {
              fetchGroups(); 
      },
      error: (err) => alert("Failed to update: " + err.responseText)
    });
  };

  return (
    <div style={{ width: '280px', height: '100vh', background: '#ffffff', borderRight: '1px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <button 
        onClick={onShowMyFeed} 
        style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
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
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Create Group</button>
      </form>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {groups.map(g => (
          <div 
            key={g._id} 
            style={{ 
              padding: '12px', 
              background: selectedGroupId === g._id ? '#e7f1ff' : '#f8f9fa', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              border: selectedGroupId === g._id ? '1px solid #9370DB' : '1px solid transparent', 
              transition: '0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span onClick={() => onSelectGroup(g)} style={{ fontWeight: selectedGroupId === g._id ? '600' : '400', flexGrow: 1 }}>
              👥 {g.name}
            </span>

            {/* כפתור מחיקה/עריכה - יופיע רק אם המשתמש הוא המנהל של הקבוצה */}
            {user && g.admin?._id === user._id && (
              
              <div style={{ display: 'flex', gap: '8px' }}> {/* כאן הוספנו את ה-gap */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleEditGroupName(g._id, g.name);
                }}
                style={{
                  padding: '6px 10px', borderRadius: '8px', border: '1px solid #9370DB',
                  background: '#ffffff', color: '#9370DB', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Edit
              </button>
              <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        deleteGroup(g._id);
                      }} 
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #dc3545',
                        background: '#ffffff', color: '#dc3545', cursor: 'pointer', fontWeight: '600'
                      }}
                      //onMouseOver={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = '#ffffff'; }}
                      //onMouseOut={(e) => { e.target.style.background = '#ffffff'; e.target.style.color = '#dc3545'; }}
                    >
                      Delete
              </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupList;