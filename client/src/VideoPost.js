function VideoPost({ videoUrl }) {
  if (!videoUrl) return null; // לא מציג כלום אם אין וידאו

  return (
    <div style={{ marginTop: '10px', borderRadius: '15px', overflow: 'hidden' }}>
      <video width="100%" height="auto" controls style={{ borderRadius: '15px', display: 'block' }}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
export default VideoPost