import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import VideoPost from './VideoPost';
import CanvasEditor from './CanvasEditor';
import GroupMembers from './GroupMembers';
import UserSearch from './UserSearch';
import PostSearch from './PostSearch';

function PostsFeed({ user, group, currentUserId, onRefresh }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [pendingVideoUrl, setPendingVideoUrl] = useState(null);
  const [pendingDrawing, setPendingDrawing] = useState(null);
  
  const token = user?.token || localStorage.getItem('token');
  const isMember = group?.members.includes(currentUserId);
  const isAdmin = group?.admin?._id === currentUserId || group?.admin === currentUserId;

  const [userResults, setUserResults] = useState([]);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'searchPosts', 'searchUsers', 'members'

  const fetchPosts = () => {
    // השתמשי ב-token מה-localStorage אם הוא לא מגיע ב-props
    const token = localStorage.getItem('token'); 
    
    $.ajax({
      url: `http://localhost:5001/api/posts?groupId=${group._id}`,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => {
        console.log("Success! Posts received:", data);
        /*setPosts(data);*/
        setPosts(data.reverse());
      },
      error: (err) => {
        console.error("Fetch failed. Status:", err.status);
      }
    });
};

 useEffect(() => { 
  console.log("PostsFeed mounted/updated. Group:", group);
  
  if (group && group._id) {
    console.log("Triggering fetchPosts for ID:", group._id);
    fetchPosts(); 
  } else {
    console.log("Waiting for group ID...");
  }
}, [group]);

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
  if (!file) return;

  // 1. תצוגה מקדימה מיידית (זה עובד כבר ב-Preview שלך)
  const previewUrl = URL.createObjectURL(file);
  setPendingVideoUrl(previewUrl); 

  // 2. העלאה לשרת
  const formData = new FormData();
  formData.append('video', file); // וודאי ששם השדה 'video' תואם למה שהשרת מצפה (למשל ב-Multer)
  
  $.ajax({
    url: 'http://localhost:5001/api/posts/upload-video',
    method: 'POST',
    data: formData,
    processData: false, 
    contentType: false,
    headers: { 'Authorization': 'Bearer ' + token },
    success: (data) => {
      console.log("Video uploaded successfully:", data);
      setPendingVideoUrl(data.videoUrl); // עדכון ל-URL הקבוע
    },
    error: (err) => {
      // הדפסת השגיאה המדויקת מהשרת ל-Console
      console.error("Server Error details:", err);
      alert("Video upload failed: " + (err.responseJSON?.message || err.statusText));
      setPendingVideoUrl(null); // ניקוי ה-Preview במקרה של כשל
    }
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

  const handleJoinRequest = () => {
    // שיניתי את ה-URL ל-join במקום request כדי שיתאים לשרת שלך
    $.ajax({
      url: `http://localhost:5001/api/groups/${group._id}/join`, 
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => {
        alert(data.message);
        // אחרי שליחה מוצלחת, כדאי לרענן כדי לראות את השינוי
        if (onRefresh) onRefresh(); 
      },
      error: (err) => alert("Failed: " + (err.responseJSON?.message || err.responseText))
    });
  };

  const approveRequest = (memberId) => {
    $.ajax({
      url: `http://localhost:5001/api/groups/${group._id}/approve/${memberId}`,
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      success: () => {
        alert("Member approved!");
        if (onRefresh) onRefresh();
      },
      error: (err) => alert("Failed to approve: " + err.responseText)
    });
  };

return (
  <div style={{ flex: 1, padding: '20px', background: '#f4f7f6', minHeight: '100vh' }}>
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      
      {/* תפריט הניווט הפנימי (ללא searchPosts) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#fff', padding: '10px', borderRadius: '12px' }}>
        {['feed', 'searchUsers', 'members'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '8px',
              background: activeTab === tab ? '#9370DB' : '#eee',
              color: activeTab === tab ? '#fff' : '#333',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* --- תוכן הטאבים --- */}

      {/* 1. טאב הפיד המאוחד (פיד + חיפוש פוסטים) */}
      {activeTab === 'feed' && (
        <>
          {/* רכיב חיפוש פוסטים מובנה בפיד */}
          <div style={{ marginBottom: '20px' }}>
            <PostSearch token={token} groupId={group._id} onSearchResults={(data) => setPosts(data)} onClear={fetchPosts} />
          </div>

          {/* רשימת בקשות למנהל */}
          {isAdmin && group.pendingRequests?.length > 0 && (
            <div style={{ padding: '20px', background: '#fef9e7', borderRadius: '16px', marginBottom: '30px', border: '2px dashed #f1c40f' }}>
              <h3 style={{ marginTop: 0, color: '#9a7d0a', fontSize: '16px' }}>Pending Join Requests ({group.pendingRequests.length}):</h3>
              {group.pendingRequests.map(reqUser => (
                <div key={reqUser._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.6)', padding: '12px 15px', borderRadius: '10px', marginTop: '10px' }}>
                  <span>{reqUser.username}</span> 
                  <button onClick={() => approveRequest(reqUser._id)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px' }}>Approve</button>
                </div>
              ))}
            </div>
          )}

          {/* טופס פוסט חדש */}
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
                <button type="button" onClick={() => setShowCanvas(!showCanvas)} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>{showCanvas ? "Close" : "Add Drawing"}</button>
                <label htmlFor="video-upload" style={{ cursor: 'pointer', padding: '8px 16px', background: '#6c757d', color: '#fff', borderRadius: '20px' }}>Upload Video</label>
                <input type="file" id="video-upload" accept="video/*" onChange={(e) => { if (e.target.files && e.target.files[0]) handleVideoUpload(e.target.files[0]); }} style={{ display: 'none' }} />
                <button type="submit" style={{ marginLeft: 'auto', padding: '8px 24px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Post</button>
              </div>
              {showCanvas && <div style={{ marginTop: '20px' }}><CanvasEditor onSave={(d) => { setPendingDrawing(d); setShowCanvas(false); }} /></div>}
            </form>
          )}

          {/* רשימת פוסטים */}
          {(isMember || isAdmin) ? (
            posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e1e8ed' }}>
                  <p><strong>{post.sender?.username}</strong></p>
                  <p>{post.content}</p>
                  {post.mediaUrl && <div style={{ maxWidth: '300px', width: '100%', margin: '10px 0', borderRadius: '8px', overflow: 'hidden' }}><VideoPost videoUrl={post.mediaUrl} /></div>}
                  {post.drawing && post.drawing.startsWith("data:image/") && <img src={post.drawing} alt="post" style={{ maxWidth: '300px', width: '100%', height: 'auto', margin: '10px 0', borderRadius: '8px', border: '1px solid #eee' }} />}
                  <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleString()}</small>
                  {(post.sender?._id === currentUserId || isAdmin) && (
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleUpdate(post._id, post.content)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #9370DB', color: '#9370DB', background: '#fff' }}>Edit</button>
                      <button onClick={() => handleDelete(post._id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #dc3545', color: '#dc3545', background: '#fff' }}>Delete</button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: '#fff', borderRadius: '12px', border: '1px solid #e1e8ed' }}><p>No posts in this group yet.</p></div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '12px', border: '1px solid #ffeeba', marginBottom: '20px' }}>
              <h3>This group is private</h3>
              {group.pendingRequests?.some(req => req._id === currentUserId) ? <p style={{ fontWeight: 'bold' }}>Your request to join is pending approval.</p> : <button onClick={handleJoinRequest} style={{ background: '#28a745', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Request to Join</button>}
            </div>
          )}
        </>
      )}

      {/* 2. טאב חיפוש משתמשים */}
      {activeTab === 'searchUsers' && (
        <>
          <UserSearch token={token} onSearchResults={setUserResults} />
          {userResults.length > 0 && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid #9370DB' }}>
              <h4>Search Results:</h4>
              {userResults.map(u => <div key={u._id} style={{ padding: '5px 0' }}>{u.username} - {u.email}</div>)}
            </div>
          )}
        </>
      )}

      {/* 3. טאב חברים */}
      {activeTab === 'members' && (
        <GroupMembers groupId={group._id} token={user.token} />
      )}

    </div>
  </div>
);
}

export default PostsFeed;