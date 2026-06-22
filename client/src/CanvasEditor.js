import React, { useRef, useState, useEffect } from 'react';

function CanvasEditor({ imageUrl, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false); 

  // Setting up the canvas and loading the background image if provided  
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

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e); 
  };

  const draw = (e) => {
    if (!isDrawing) return; 
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round'; 
    ctx.strokeStyle = 'black'; 
    
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
    canvasRef.current.getContext('2d').beginPath(); // Reset path
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