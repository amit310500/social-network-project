import React, { useState } from 'react';
import $ from 'jquery';

// Sends a search request to the backend with the provided filter
function UserSearch({ token, onSearchResults }) {
  const [params, setParams] = useState({ username: "", email: "", startDate: "" });

  const handleUserSearch = () => {
    $.ajax({
      url: `http://localhost:5001/api/users/search/users`,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      data: params,
      success: (data) => {
        console.log("Search results:", data);
        onSearchResults(data); // Pass results back to the parent component
      },
      error: (err) => {
        alert("Search failed: " + (err.responseJSON?.message || "Check console"));
      }
    });
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e1e8ed', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0 }}>Find Users</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Username..." 
          onChange={e => setParams({...params, username: e.target.value})} 
          style={inputStyle}
        />
        <input 
          placeholder="Email..." 
          onChange={e => setParams({...params, email: e.target.value})} 
          style={inputStyle}
        />
        <input 
          type="date" 
          onChange={e => setParams({...params, startDate: e.target.value})} 
          style={inputStyle}
        />
        <button onClick={handleUserSearch} style={buttonStyle}>Search</button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ccc' };
const buttonStyle = { padding: '8px 16px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };

export default UserSearch;