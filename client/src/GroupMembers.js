import React, { useState, useEffect, useCallback } from 'react';
import $ from 'jquery';

function GroupMembers({ groupId, token, isAdmin, currentUserId }) {
    const [members, setMembers] = useState([]);

    const fetchMembers = useCallback(() => {
        $.ajax({
            url: `http://localhost:5001/api/groups/${groupId}/members`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
            success: (data) => setMembers(data),
            error: (err) => console.error("Error fetching members:", err)
        });
    }, [groupId, token]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRemove = (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        $.ajax({
            url: `http://localhost:5001/api/groups/${groupId}/member/${memberId}`,
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token },
            success: () => {
                fetchMembers(); 
            },
            error: (err) => alert("Failed to remove: " + (err.responseJSON?.message || "Error"))
        });
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginTop: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
            <h4 style={{ marginBottom: '20px', color: '#333' }}>Group Members ({members.length})</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {members.map(member => (
                    <li key={member._id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '10px',
                        background: '#fcfcfc',
                        borderRadius: '10px',
                        border: '1px solid #f9f9f9'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', marginRight: '10px' }}>👤</span>
                            <div>
                                <div style={{ fontWeight: '600', color: '#222' }}>{member.username}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>{member.email}</div>
                            </div>
                        </div>

                        {/* כפתור הסרה למנהל בלבד, שלא יכול להסיר את עצמו */}
                        {(isAdmin && member._id !== currentUserId) && (
                            <button 
                                onClick={() => handleRemove(member._id)}
                                style={{ 
                                    background: '#fff', 
                                    color: '#e74c3c', 
                                    border: '1px solid #e74c3c', 
                                    padding: '6px 12px', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    transition: '0.3s'
                                }}
                            >
                                Remove
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default GroupMembers;