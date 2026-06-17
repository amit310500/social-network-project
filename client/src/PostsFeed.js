import React, { useEffect, useState, useRef } from 'react';
import $ from 'jquery';
import VideoPost from './VideoPost';
import CanvasEditor from './CanvasEditor';

function PostsFeed({ user, group, currentUserId, onRefresh }) {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useState({ text: "", username: "", startDate: "" });
  const [newPost, setNewPost] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const token = user?.token || localStorage.getItem('token');
  const [pendingVideoUrl, setPendingVideoUrl] = useState(null);
  const [pendingDrawing, setPendingDrawing] = useState(null);

  const isMember = group?.members.includes(currentUserId);
  const isAdmin = group?.admin?._id === currentUserId || group?.admin === currentUserId;
  //const isPending = group?.pendingRequests.includes(currentUserId);

  const [isRequesting, setIsRequesting] = useState(false);
  const [isLocalPending, setIsLocalPending] = useState(false);
  const isPending = isRequesting || isLocalPending || (group?.pendingRequests || []).some(
  (r) => (r._id === currentUserId || r === currentUserId));

  const inputStyle = { 
    padding: '8px', 
    borderRadius: '5px', 
    border: '1px solid #ccc', 
    flex: 1 
    };
  
  const btnStyle = {
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: '#007bff',
    color: '#fff',
    fontSize: '12px'
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
    // ברגע שהמשתמש מופיע ב-members, אנחנו יודעים בוודאות שהוא אושר.
    // רק אז נבטל את ה-isLocalPending.
    if (group?.members?.includes(currentUserId)) {
      setIsLocalPending(false);
    }
  }, [group?.members, currentUserId]);

  useEffect(() => {
      if (group?._id) {
        fetchPosts();
      }
    }, [group?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // בדיקה מחמירה: אם הכל ריק - אל תשלחי כלום ותני התראה
    const hasText = newPost.trim().length > 0;
    const hasMedia = pendingVideoUrl !== null;
    const hasDrawing = pendingDrawing !== null;

    if (!hasText && !hasMedia && !hasDrawing) {
      alert("Please enter text, add a drawing, or upload a video before posting.");
      return; // עוצר את הפונקציה כאן
    }

    // אם הגענו לכאן, סימן שיש לפחות משהו אחד
    $.ajax({
      url: 'http://localhost:5001/api/posts',
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ 
          content: newPost.trim().length > 0 ? newPost.trim() : null,
          groupId: group._id, 
          mediaUrl: pendingVideoUrl, 
          drawing: pendingDrawing
      }),
      success: (p) => { 
        setNewPost(""); 
        setPendingVideoUrl(null);
        setPendingDrawing(null);
        // הוספת הפוסט החדש לראש הרשימה
        setPosts([p, ...posts]);
        setShowCanvas(false);
      },
      error: (err) => {
        console.error("Server error:", err);
        alert("Error creating post. Please try again.");
      }
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
  setIsLocalPending(true); 
  setIsRequesting(true); // חיווי שהבקשה בעיבוד

  $.ajax({
    url: `http://localhost:5001/api/groups/${group._id}/join`,
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    success: (data) => {
      // לא מאפסים את isLocalPending כאן! 
      // הממשק יישאר על "Pending" עד ש-onRefresh יביא את ה-group המעודכן עם המשתמש ב-members.
      alert(data.message);
      if (onRefresh) onRefresh(); 
    },
    error: (err) => {
      setIsLocalPending(false); 
      setIsRequesting(false);
      alert("Failed: " + (err.responseJSON?.message || "Error"));
    }
  });
};

  const approveMember = (userId) => {
    console.log("Approving user ID:", userId); // תוסיפי את זה!
    if (!userId) {
        console.error("Error: userId is undefined!");
        return;
    }
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

  const handleDelete = (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    $.ajax({
      url: `http://localhost:5001/api/posts/${postId}`,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
      success: () => {
        setPosts(posts.filter(p => p._id !== postId));
        if (onRefresh) onRefresh();
      },
      error: (err) => alert("Failed to delete post")
    });
  };

  const handleUpdate = (postId, newContent) => {
    const updatedContent = prompt("Edit your post:", newContent);
    if (!updatedContent || updatedContent === newContent) return;

    $.ajax({
      url: `http://localhost:5001/api/posts/${postId}`,
      method: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      data: JSON.stringify({ content: updatedContent }),
      success: (updatedPost) => {
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        if (onRefresh) onRefresh();
      },
      error: () => alert("Failed to update post")
    });
  };

  const handleVideoUpload = (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    $.ajax({
      url: 'http://localhost:5001/api/posts/upload-video',
      method: 'POST',
      data: formData,
      processData: false, 
      contentType: false, 
      headers: { 'Authorization': 'Bearer ' + token },
      success: (data) => {
        // כאן אנחנו שומרים את ה-URL בסטייט במקום לקרוא לפונקציה לא קיימת
        setPendingVideoUrl(data.videoUrl);
      },
      error: (err) => {
        console.error(err);
        alert("Failed to upload video");
      }
    });
  };


  {console.log("Group Object structure:", group)}
  {console.log("Group object received in PostsFeed:", group)}
  {console.log("Pending requests in group:", group.pendingRequests)}

  return (
    <div style={{ 
    border: '1px solid #e1e8ed', 
    borderRadius: '10px', 
    padding: '15px', 
    marginBottom: '20px', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    maxWidth: '600px', 
    width: '90%', 
    margin: '0 auto 20px auto' 
}}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        {console.log("Pending requests data:", group.pendingRequests)}
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
          
          {group.pendingRequests && group.pendingRequests.length > 0 ? (
            group.pendingRequests.map((requestUser) => (
              <div key={requestUser._id || requestUser} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px 0',
                borderBottom: '1px solid #f3e5ab' 
              }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  {requestUser.username ? requestUser.username : "Loading..."}
                </span>
                
                {/* הכפתור המעוצב */}
                <button 
                  onClick={() => approveMember(requestUser._id || requestUser)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#28a745', // ירוק אישור
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Approve
                </button>
              </div>
            ))
          ) : (
            <p>No pending requests.</p>
          )}
  
        </div>
      )}

        {isMember || isAdmin ? (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <textarea 
              value={newPost} 
              onChange={e => setNewPost(e.target.value)} 
              placeholder="What's on your mind?" 
              style={{ width: '100%', border: 'none', resize: 'none', fontSize: '16px', outline: 'none', marginBottom: '10px' }} 
            />
            {pendingVideoUrl && (
                    <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                      <p>Video Preview:</p>
                      <video src={pendingVideoUrl} width="100%" controls />
                      <button 
                        onClick={() => setPendingVideoUrl(null)} 
                        style={{ marginTop: '10px', background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
              {pendingDrawing && (
                <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                  <p>Drawing Preview:</p>
                  <img src={pendingDrawing} alt="Preview" style={{ maxWidth: '100%' }} />
                  <button 
                    type="button" 
                    onClick={() => setPendingDrawing(null)} 
                    style={{ marginTop: '10px', display: 'block', background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                  >
                    Remove Drawing
                  </button>
                </div>
              )}
            
            <div style={{ textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {/* כפתור הוספת הציור */}
              <button 
                type="button" 
                onClick={() => setShowCanvas(!showCanvas)} 
                style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
              >
                {showCanvas ? "Close Canvas" : "Add Drawing"}
              </button>
              <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => handleVideoUpload(e.target.files[0])} 
                  style={{ display: 'none' }} 
                  id="video-upload" 
                />
                <label htmlFor="video-upload" style={{ cursor: 'pointer', padding: '10px 20px', background: '#6c757d', color: '#fff', borderRadius: '20px' }}>
                  Upload Video
                </label>

              {/* כפתור שליחת הפוסט */}
              <button type="submit" style={{ padding: '10px 25px', background: '#9370DB', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                Post
              </button>
            </div>

            {/* הצגת הקנבס רק אם המשתמש לחץ על "Add Drawing" */}
            {showCanvas && (
              <div style={{ marginTop: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                <CanvasEditor onSave={(dataUrl) => {
                  setPendingDrawing(dataUrl); // במקום setNewPost
                  setShowCanvas(false);
                }} />
              </div>
            )}
          </form>
        ) : (
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', border: '1px solid #ffeeba' }}>
            {isPending ? (
              <p>Your request is pending admin approval.</p>
            ) : (
              <div>
                <p>You are not a member of this group.</p>
                <button 
                  disabled={isRequesting} 
                  onClick={handleJoinRequest} 
                  style={{ 
                    padding: '10px 20px', 
                    background: isRequesting ? '#ccc' : '#28a745', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: isRequesting ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {isRequesting ? 'Sending...' : 'Request to Join'}
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
          {isMember || isAdmin ? (
            posts.length > 0 ? (
              posts.map((post) => (
  <div key={post._id} style={{ 
      background: '#fff', 
      padding: '15px', 
      borderRadius: '10px', 
      marginBottom: '20px', // שיניתי מ-15 ל-20 לאחידות
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)', // צל זהה ל-MyFeed
      border: '1px solid #e1e8ed', // הוספתי גבול זהה ל-MyFeed
      maxWidth: '600px', // הוספתי הגבלת רוחב
      width: '90%',      // רוחב יחסי
      margin: '0 auto 20px auto' // מרכוז
  }}>
    <p><strong>{post.sender?.username || 'Unknown'}</strong></p>
    
    <div style={{ margin: '10px 0', width: '100%' }}>
      {post.mediaUrl ? (
        <div style={{ maxWidth: '300px', width: '100%', margin: '10px 0' }}>
            <VideoPost videoUrl={post.mediaUrl} />
        </div>
      ) : (
        <>
          {post.content && post.content.trim() !== " " && (
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1em' }}>{post.content}</p>
          )}
          
          {post.drawing && post.drawing.startsWith("data:image/") && (
            <img 
              src={post.drawing} 
              alt="Drawing" 
              style={{ 
                maxWidth: '300px', // גודל מוקטן ואחיד
                width: '100%', 
                height: 'auto', 
                display: 'block', 
                margin: '10px 0', 
                borderRadius: '8px',
                border: '1px solid #eee'
              }} 
            />
          )}
        </>
      )}
    </div>
    
    <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
    
    {(post.sender?._id === currentUserId || isAdmin) && (
      <div style={{ marginTop: '15px', display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => handleUpdate(post._id, post.content)} 
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #9370DB', background: '#ffffff', color: '#9370DB', cursor: 'pointer', fontWeight: '600' }}
        >
          Edit
        </button>
        <button 
          onClick={() => handleDelete(post._id)} 
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #dc3545', background: '#ffffff', color: '#dc3545', cursor: 'pointer', fontWeight: '600' }}
        >
          Delete
        </button>
      </div>
    )}
  </div>
))
                
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>No posts in this group yet.</p>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px dashed #ccc', color: '#666' }}>
              <h3>🔒 Private Group</h3>
              <p>You must be an approved member to view posts in this group.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostsFeed;