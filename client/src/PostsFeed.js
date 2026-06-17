import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import VideoPost from './VideoPost';
import CanvasEditor from './CanvasEditor';

function PostsFeed({ user, group, currentUserId, onRefresh }) {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useState({ text: "", username: "", startDate: "" });
  const [newPost, setNewPost] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [pendingVideoUrl, setPendingVideoUrl] = useState(null);
  const [pendingDrawing, setPendingDrawing] = useState(null);
  
  const token = user?.token || localStorage.getItem('token');
  const isMember = group?.members.includes(currentUserId);
  const isAdmin = group?.admin?._id === currentUserId || group?.admin === currentUserId;

  const fetchPosts = () => {
    if (!isMember && !isAdmin) return;
    $.ajax({
      url: `http://localhost:5001/api/posts?groupId=${group._id}`,
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPosts(data)
    });
  };

  // בתוך PostsFeed.js
useEffect(() => { 
  if (group?._id) {
    setPosts([]); // איפוס הפיד הקיים לפני הטעינה החדשה
    fetchPosts(); // קריאה חוזרת מהשרת
  }
}, [group?._id]);

 const handleSubmit = (e) => {
  e.preventDefault();

  // 1. הגדרת תוכן ברירת מחדל אם הכל ריק
  let finalContent = newPost.trim();
  if (!finalContent && !pendingVideoUrl && !pendingDrawing) {
    alert("Please add content to your post!");
    return;
  }

  // 2. הכנת האובייקט
  const postData = { 
    content: finalContent, 
    groupId: group._id, 
    mediaUrl: pendingVideoUrl, 
    drawing: pendingDrawing 
  };

  console.log("Submitting:", postData); // נבדוק מה נשלח ב-Console

  $.ajax({
    url: 'http://localhost:5001/api/posts',
    method: 'POST',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + token },
    data: JSON.stringify(postData),
    success: (p) => { 
      setNewPost(""); 
      setPendingVideoUrl(null); 
      setPendingDrawing(null);
      setPosts([p, ...posts]); 
      setShowCanvas(false); 
    },
    error: (err) => {
      console.error("Server Error:", err.responseText);
      alert("Failed: " + (err.responseJSON?.message || "Check the console"));
    }
  });
};

  const handleVideoUpload = (file) => {
    const formData = new FormData();
    formData.append('video', file);
    $.ajax({
      url: 'http://localhost:5001/api/posts/upload-video',
      method: 'POST',
      data: formData,
      processData: false, contentType: false,
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => setPendingVideoUrl(data.videoUrl)
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

  const handleUpdate = (postId, content) => {
    const updatedContent = prompt("Edit your post:", content);
    if (!updatedContent) return;
    $.ajax({
      url: `http://localhost:5001/api/posts/${postId}`,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ content: updatedContent }),
      success: (updated) => setPosts(posts.map(p => p._id === postId ? updated : p))
    });
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px' }}>
      {/* טופס פוסט מעוצב */}
      {(isMember || isAdmin) && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e1e8ed' }}>
          <textarea 
            value={newPost} onChange={e => setNewPost(e.target.value)} 
            placeholder="What's on your mind?" 
            style={{ width: '100%', border: 'none', resize: 'none', fontSize: '16px', outline: 'none', marginBottom: '15px' }} 
          />
          {(pendingVideoUrl || pendingDrawing) && (
    <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e1e8ed' }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Preview:</p>
      {pendingVideoUrl && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <video src={pendingVideoUrl} width="200" controls style={{ borderRadius: '8px' }} />
          <button type="button" onClick={() => setPendingVideoUrl(null)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px' }}>×</button>
        </div>
      )}
      {pendingDrawing && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={pendingDrawing} alt="Preview" style={{ width: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button type="button" onClick={() => setPendingDrawing(null)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px' }}>×</button>
        </div>
      )}
    </div>
  )}
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="button" onClick={() => setShowCanvas(!showCanvas)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
              {showCanvas ? "Close" : "Add Drawing"}
            </button>
            <label htmlFor="video-upload" style={{ cursor: 'pointer', padding: '8px 16px', background: '#6c757d', color: '#fff', borderRadius: '20px' }}>Upload Video</label>
            <input type="file" id="video-upload" onChange={(e) => handleVideoUpload(e.target.files[0])} style={{ display: 'none' }} />
            
            <button type="submit" style={{ marginLeft: 'auto', padding: '8px 24px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
              Post
            </button>
          </div>
          {showCanvas && <div style={{ marginTop: '20px' }}><CanvasEditor onSave={(d) => { setPendingDrawing(d); setShowCanvas(false); }} /></div>}
        </form>
      )}

      {/* רשימת פוסטים */}
      <div>
        {posts.map(post => (
          <div key={post._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e1e8ed' }}>
            <p><strong>{post.sender?.username}</strong></p>
            <p>{post.content}</p>
            {post.mediaUrl && <VideoPost videoUrl={post.mediaUrl} />}
            {post.drawing && <img src={post.drawing} alt="post" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
            
            {(post.sender?._id === currentUserId || isAdmin) && (
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button onClick={() => handleUpdate(post._id, post.content)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #9370DB', color: '#9370DB', background: '#fff' }}>Edit</button>
                <button onClick={() => handleDelete(post._id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #dc3545', color: '#dc3545', background: '#fff' }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostsFeed;