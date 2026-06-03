import React, { useEffect, useState } from 'react';
import $ from 'jquery';

function MyFeed({ user, currentUserId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    $.ajax({
      url: `http://localhost:5001/api/posts/my-feed`,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + user.token },
      success: (data) => setPosts(data),
      error: (err) => console.error("Error fetching posts:", err)
    });
  }, [currentUserId, user.token]);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>My Posts</h2>
      
      {posts.length === 0 ? (
        <p>You haven't posted anything yet.</p>
      ) : (
        posts.map(post => {
          // כאן ה-Log שביקשת
          console.log("Post object:", post); 
          
          return (
            <div key={post._id} style={{ 
              border: '1px solid #e1e8ed', 
              borderRadius: '10px', 
              padding: '15px', 
              marginBottom: '15px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              backgroundColor: '#fff',
              transition: 'transform 0.2s'
            }}>
              {/* Header: שם הקבוצה ותאריך */}
              <div style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '5px' }}>
                <span style={{ 
                  backgroundColor: '#e0f7fa', 
                  color: '#006064', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.8em', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {/* בודקים אם יש group או groupId לפי מה שה-log יראה לך */}
                  {post.group?.name || "General"}
                </span>
                <span style={{ float: 'right', fontSize: '0.8em', color: '#aaa' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {/* Content */}
              <p style={{ margin: '15px 0', fontSize: '1.1em', color: '#14171a' }}>{post.content}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyFeed;