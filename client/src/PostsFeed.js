import React, { useEffect, useState } from 'react';
import $ from 'jquery';

function PostsFeed({ user, groupId, currentUserId }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [searchParams, setSearchParams] = useState({ text: '', username: '', startDate: '' });
  const token = user?.token || localStorage.getItem('token');

  // הגדרת סגנון אחיד לאינפוטים
  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 };

  const fetchPosts = () => {
    if (!groupId) return;
    $.ajax({
      url: `http://localhost:5001/api/posts?groupId=${groupId}`,
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPosts(data)
    });
  };

  useEffect(() => { fetchPosts(); }, [groupId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    $.ajax({
      url: 'http://localhost:5001/api/posts',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ content: newPost, groupId }),
      success: (p) => { 
        setNewPost(""); 
        setPosts([p, ...posts]); 
      }
    });
  };

  const handleSearch = () => {
    $.ajax({
      url: `http://localhost:5001/api/posts/search`,
      data: { ...searchParams, groupId },
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPosts(data),
      error: (err) => console.error("Search error", err)
    });
  };

  const handleDelete = (postId) => {
    $.ajax({
      url: `http://localhost:5001/api/posts/${postId}`,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
      success: () => setPosts(posts.filter(p => p._id !== postId))
    });
  };

  const handleUpdate = (postId, currentContent) => {
  const newContent = prompt("Edit your post:", currentContent);
  if (!newContent || newContent === currentContent) return;

  $.ajax({
    url: `http://localhost:5001/api/posts/${postId}`,
    method: 'PUT',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + token },
    data: JSON.stringify({ content: newContent }),
    success: (updatedPost) => {
      setPosts(posts.map(p => p._id === postId ? updatedPost : p));
    },
    error: (err) => alert("Failed to update post")
  });
};

  return (
    <div style={{ flex: 1, padding: '20px', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        {/* טופס יצירת פוסט */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', border: 'none', resize: 'none', fontSize: '16px', outline: 'none', marginBottom: '10px' }} />
          <div style={{ textAlign: 'right' }}>
            <button type="submit" style={{ padding: '10px 25px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Post</button>
          </div>
        </form>

        {/* טופס חיפוש מעוצב */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <input placeholder="Content..." onChange={e => setSearchParams({...searchParams, text: e.target.value})} style={inputStyle} />
            <input placeholder="Username..." onChange={e => setSearchParams({...searchParams, username: e.target.value})} style={inputStyle} />
            <input type="date" onChange={e => setSearchParams({...searchParams, startDate: e.target.value})} style={inputStyle} />
            <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
        </div>

        {/* פוסטים */}
        {posts.map(p => {
          const date = new Date(p.createdAt).toLocaleString();
          return (
            <div key={p._id} style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ fontSize: '15px' }}>{p.sender?.username}</strong>
                <span style={{ fontSize: '12px', color: '#888' }}>{date}</span>
              </div>
              
              <p style={{ margin: '0 0 10px 0' }}>{p.content}</p>
              
              {p.sender?._id === currentUserId && (
  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
    {/* כפתור עריכה */}
    <button 
      onClick={() => handleUpdate(p._id, p.content)} 
      style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px' }}>
      Edit
    </button>
    {/* כפתור מחיקה עדין */}
    <button 
      onClick={() => handleDelete(p._id)} 
      style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px' }}>
      Delete
    </button>
  </div>
)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default PostsFeed;