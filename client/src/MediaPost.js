import React from 'react';

function MediaPost({ mediaUrl }) {
  if (!mediaUrl) return null;

  //const fullUrl = mediaUrl.startsWith('http') ? mediaUrl : `http://localhost:5001/${mediaUrl}`;

  const fullUrl = (mediaUrl.startsWith('http') || mediaUrl.startsWith('blob')) 
    ? mediaUrl 
    : `http://localhost:5001/${mediaUrl}`;
  
  // זיהוי סיומות וידאו כולל mov
  const isVideo = fullUrl.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      {isVideo ? (
        <video controls width="100%" key={fullUrl}>
          {/* הוספת סוגים נוספים לתאימות טובה יותר */}
          <source src={fullUrl} type={fullUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img 
          src={fullUrl} 
          alt="post media" 
          style={{ width: '100%' }} 
          onError={(e) => { 
            console.error("Failed to load:", fullUrl);
            e.target.style.display = 'none'; // מסתיר אם התמונה שבורה
          }} 
        />
      )}
    </div>
  );
}

export default MediaPost;