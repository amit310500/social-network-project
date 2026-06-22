import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import VideoPost from './MediaPost';

function MyFeed({ user, currentUserId }) {
const [posts, setPosts] = useState([]);

// Fetch the user's personal posts from the server
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
  boxSizing: 'border-box', 
  overflowX: 'hidden' 
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
              
              maxWidth: '600px', 
              width: '90%', 
              margin: '0 auto 20px auto' 
}}>
{/* Post Header: Show group name and creation date */}
<div style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '5px' }}>
  <span style={{ backgroundColor: '#e0f7fa', color: '#006064', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase' }}>
  {post.group?.name || "General"}
  </span>
  <span style={{ float: 'right', fontSize: '0.8em', color: '#aaa' }}>
  {new Date(post.createdAt).toLocaleDateString()}
</span>
</div>
{/* Content section */}
<div style={{ margin: '10px 0' }}>

{/* If media exists (photo/video), render via MediaPost component */}
  {post.mediaUrl ? (
  <div style={{ maxWidth: '300px', width: '100%', margin: '10px 0' }}>
  <VideoPost videoUrl={post.mediaUrl} />
      </div>
          ) : (
          <>
          {post.content && (
            <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0', fontSize: '1.1em' }}>{post.content}</p>
            )}
              {post.drawing && post.drawing.startsWith("data:image/") && (<img 
                src={post.drawing} 
                alt="Drawing" 
                style={{ 
                    maxWidth: '300px', 
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