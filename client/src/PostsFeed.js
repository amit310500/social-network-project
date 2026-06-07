import React, { useEffect, useState } from 'react';
import $ from 'jquery';

function PostsFeed({ user, group, currentUserId, onRefresh }) {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useState({ text: "", username: "", startDate: "" });
  const [newPost, setNewPost] = useState("");
  const token = user?.token || localStorage.getItem('token');

  const isMember = group?.members.includes(currentUserId);
  const isAdmin = group?.admin?._id === currentUserId || group?.admin === currentUserId;
  //const isPending = group?.pendingRequests.includes(currentUserId);

  const [isLocalPending, setIsLocalPending] = useState(false);
  const isPending = isLocalPending || group?.pendingRequests.includes(currentUserId);

  const inputStyle = { 
    padding: '8px', 
    borderRadius: '5px', 
    border: '1px solid #ccc', 
    flex: 1 
    };

  const fetchPosts = () => {
    if (!isMember && !isAdmin) return;
    if (!group?._id) return;
    $.ajax({
      url: `http://localhost:5001/api/posts?groupId=${group._id}`,
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPosts(data),
      error: (err) => console.error("Error fetching posts", err)
    });
  };

  useEffect(() => {
    if (group?._id) {
      fetchPosts(); 
      // אם יש פונקציית רענון חיצונית, נקרא לה כדי לוודא שה-group ב-State של האבא מעודכן
      if (onRefresh) {
        onRefresh();
      }
    }
  }, [group?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    $.ajax({
      url: 'http://localhost:5001/api/posts',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ content: newPost, groupId: group._id }),
      success: (p) => { 
        setNewPost(""); 
        setPosts([p, ...posts]); 
      },
      error: () => alert("You must be an approved member to post!")
    });
  };

  const handleSearch = () => {
    $.ajax({
      url: `http://localhost:5001/api/posts/search`,
      data: { ...searchParams, groupId: group._id },
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPosts(data),
      error: (err) => console.error("Search error", err)
    });
  };

  const clearSearch = () => {
    setSearchParams({ text: "", username: "", startDate: "" });
    fetchPosts(); // טעינה מחדש של כל הפוסטים
  };

  const handleJoinRequest = () => {
    setIsLocalPending(true); // עדכון מיידי של הממשק
    $.ajax({
      url: `http://localhost:5001/api/groups/${group._id}/join`,
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => {
        alert(data.message);
        if (onRefresh) onRefresh(); 
      },
      error: (err) => {
        setIsLocalPending(false); // במקרה של שגיאה, נחזיר את הכפתור
        alert("Failed: " + err.responseJSON?.message);
      }
    });
  };

  const approveMember = (userId) => {
    $.ajax({
      url: `http://localhost:5001/api/groups/${group._id}/approve/${userId}`,
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      success: () => {
        alert("Member approved!");
        if (onRefresh) onRefresh(); // עדכון הנתונים ב-App בלי רענון דף
      },
      error: () => alert("Error approving member")
    });
  };

  // ... (handleDelete ו-handleUpdate נשארים ללא שינוי)

  return (
    <div style={{ flex: 1, padding: '20px', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        {isAdmin && group.pendingRequests && group.pendingRequests.length > 0 && (
        <div style={{ 
          padding: '20px', 
          background: '#fef9e7', // רקע צהבהב בהיר מאוד ומובדל מהלבן של הפוסטים
          borderRadius: '16px', 
          marginBottom: '30px', 
          border: '2px dashed #f1c40f', // גבול מקווקו צהוב כדי להדגיש שזה אזור ניהולי
          boxShadow: 'none' // ביטול הצל כדי שירגיש "שטוח" ומיוחד
        }}>
          <h3 style={{ marginTop: 0, color: '#9a7d0a', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pending Join Requests ({group.pendingRequests.length})
          </h3>
          
          {group.pendingRequests.map((requestUser) => (
            <div key={requestUser._id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'rgba(255, 255, 255, 0.6)', // רקע לבן שקוף בתוך הקופסה
              padding: '12px 15px',
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{requestUser.username}</span>
              <button 
                onClick={() => approveMember(requestUser._id)}
                style={{ 
                  padding: '6px 15px', 
                  background: '#27ae60', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '20px', // כפתור מעוגל נראה פחות כמו פוסט
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}

        {isMember || isAdmin ? (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', border: 'none', resize: 'none', fontSize: '16px', outline: 'none', marginBottom: '10px' }} />
            <div style={{ textAlign: 'right' }}>
              <button type="submit" style={{ padding: '10px 25px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Post</button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', border: '1px solid #ffeeba' }}>
            {isPending ? (
              <p>Your request is pending admin approval.</p>
            ) : (
              <div>
                <p>You are not a member of this group.</p>
                <button onClick={handleJoinRequest} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Request to Join
                </button>
              </div>
            )}
          </div>
        )}
        {/* טופס חיפוש מעוצב */}
        {(isMember || isAdmin) && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <input 
            placeholder="Content..." 
            value={searchParams.text} // הוסף את זה
            onChange={e => setSearchParams({...searchParams, text: e.target.value})} 
            style={inputStyle} 
          />
          <input 
            placeholder="Username..." 
            value={searchParams.username} // הוסף את זה
            onChange={e => setSearchParams({...searchParams, username: e.target.value})} 
            style={inputStyle} 
          />
          <input 
            type="date" 
            value={searchParams.startDate} // הוסף את זה
            onChange={e => setSearchParams({...searchParams, startDate: e.target.value})} 
            style={inputStyle} 
          />
          <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
          <button onClick={clearSearch} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Clear</button>
        </div>
        )}
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <p><strong>{post.sender?.username || 'Unknown'}</strong></p>
                <p>{post.content}</p>
                <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No posts in this group yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostsFeed;