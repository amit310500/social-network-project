import React, { useState, useEffect } from 'react';
import $ from 'jquery';

function GroupMembers({ groupId, token }) {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        $.ajax({
            url: `http://localhost:5001/api/groups/${groupId}/members`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
            success: (data) => setMembers(data),
            error: (err) => console.error("Error fetching members:", err)
        });
    }, [groupId, token]);

    return (
        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
            <h4>Group Members ({members.length})</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {members.map(member => (
                    <li key={member._id} style={{ marginBottom: '5px' }}>
                        👤 {member.username} ({member.email})
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default GroupMembers;