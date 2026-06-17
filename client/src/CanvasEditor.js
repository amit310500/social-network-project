import React, { useRef, useState, useEffect } from 'react';

function CanvasEditor({ imageUrl, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false); // בודק האם המשתמש כרגע "לחוץ"

  // טעינת הרקע/תמונה הראשונית
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 500, 300);
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => ctx.drawImage(img, 0, 0, 500, 300);
    }
  }, [imageUrl]);

  // פונקציות הציור החדשות
  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e); // כדי שנוכל לצייר נקודה גם בלחיצה בודדת
  };

  const draw = (e) => {
    if (!isDrawing) return; // צייר רק אם הכפתור לחוץ
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round'; // הופך את הקו למעוגל וחלק
    ctx.strokeStyle = 'black'; 
    
    // חישוב המיקום של העכבר בתוך הקנבס
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    canvasRef.current.getContext('2d').beginPath(); // איפוס הנתיב
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width={500} height={300} 
        // אלו האירועים שגורמים לציור חופשי
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: '2px solid #ccc', cursor: 'crosshair', display: 'block', marginBottom: '10px' }} 
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={clearCanvas} style={{ padding: '8px 16px', cursor: 'pointer' }}>Clear</button>
        <button type="button" onClick={() => onSave(canvasRef.current.toDataURL())} style={{ padding: '8px 16px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Save Drawing</button>
      </div>
    </div>
  );
}
export default CanvasEditor;