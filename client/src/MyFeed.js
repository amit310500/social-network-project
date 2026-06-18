import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import VideoPost from './VideoPost';

function MyFeed({ user, currentUserId }) {
const [posts, setPosts] = useState([]);

useEffect(() => {
$.ajax({
url: `http://localhost:5001/api/posts/my-feed`,
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + (user.token || localStorage.getItem('token')) },
  success: (data) => setPosts(data),
  error: (err) => console.error("Error fetching posts:", err)
 });
}, [currentUserId, user.token]);

return (
<div style={{ 
  padding: '20px', 
  width: '100%', 
  boxSizing: 'border-box', // חשוב מאוד כדי שה-padding לא ירחיב את הדף
  overflowX: 'hidden' // מונע גלילה ימינה ושמאלה
}}>
<h2 style={{ color: '#333', marginBottom: '20px' }}>My Posts</h2>

{posts.length === 0 ? (
<p>You haven't posted anything yet.</p>
) : (
  posts.map(post => (
  <div key={post._id} style={{ 
              border: '1px solid #e1e8ed', 
              borderRadius: '10px', 
              padding: '15px', 
              marginBottom: '20px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              backgroundColor: '#fff',
              
              maxWidth: '600px', // הגבלה לרוחב הפוסט (ניתן לשנות ל-500px אם רוצים צר יותר)
              width: '90%', // רוחב יחסי למסכים קטנים
              margin: '0 auto 20px auto' // ממקם את הפוסט במרכז המסך
}}>
{/* Header */}
<div style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '5px' }}>
  <span style={{ backgroundColor: '#e0f7fa', color: '#006064', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase' }}>
  {post.group?.name || "General"}
  </span>
  <span style={{ float: 'right', fontSize: '0.8em', color: '#aaa' }}>
  {new Date(post.createdAt).toLocaleDateString()}
</span>
</div>
{/* Content & Media - בתוך ה-map */}
<div style={{ margin: '10px 0' }}>

  {/* 1. הצגת וידאו אם קיים */}
  {post.mediaUrl ? (
  <div style={{ maxWidth: '300px', width: '100%', margin: '10px 0' }}>
  <VideoPost videoUrl={post.mediaUrl} />
      </div>
          ) : (
          <>
          {/* 2. הצגת טקסט אם קיים */}
          {post.content && (
            <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0', fontSize: '1.1em' }}>{post.content}</p>
            )}
              {/* 3. הצגת הציור משדה ה-drawing */}
              {post.drawing && post.drawing.startsWith("data:image/") && (<img 
                src={post.drawing} 
                alt="Drawing" 
                style={{ 
                    maxWidth: '300px', // גודל מוקטן
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
  </div>
  ))
)}
</div>
);
}

export default MyFeed;