import React, { useState } from 'react';
import $ from 'jquery';

function PostSearch({ token, groupId, onSearchResults, onClear }) {
  const [searchParams, setSearchParams] = useState({ content: "", username: "", startDate: "" });

  // PostSearch.js - בתוך הפונקציה handleSearch
const handleSearch = () => {
    $.ajax({
      url: `http://localhost:5001/api/posts/search/posts`,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      data: { 
        text: searchParams.content, 
        username: searchParams.username,
        startDate: searchParams.startDate,
        groupId: groupId // כאן השתמשנו ב-prop שעובר מהאב, ולא ב-group._id שלא קיים כאן
      },
      success: (data) => {
        onSearchResults(data); // מעדכן את ה-posts ב-PostsFeed
      },
      error: (err) => {
        console.error("Search error:", err);
        alert("Search failed: " + err.responseText);
      }
    });
};
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e1e8ed', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h4 style={{ marginTop: 0 }}>Search Posts</h4>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input placeholder="Content..." onChange={e => setSearchParams({...searchParams, content: e.target.value})} style={inputStyle} />
        <input placeholder="Username..." onChange={e => setSearchParams({...searchParams, username: e.target.value})} style={inputStyle} />
        <input type="date" onChange={e => setSearchParams({...searchParams, startDate: e.target.value})} style={inputStyle} />
        <button onClick={handleSearch} style={buttonStyle}>Search</button>
        <button onClick={onClear} style={secondaryButtonStyle}>Clear</button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 };
const buttonStyle = { padding: '8px 16px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const secondaryButtonStyle = { padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };

export default PostSearch;