import React, { useState } from 'react';
import Login from './Login';
import Register from './Register'; 
import GroupList from './GroupList';
import PostsFeed from './PostsFeed';
import MyFeed from './MyFeed'; // הקומפוננטה החדשה שתצטרכי ליצור

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // ניהול מצב התצוגה: 'dashboard', 'group', 'my-feed'
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setUser(null);
    setViewMode('dashboard');
    setSelectedGroupId(null);
  };

  const handleGroupSelect = (group) => {
    setViewMode('group');
    setSelectedGroupId(group._id);
    setSelectedGroupName(group.name);
  };

  const handleShowMyFeed = () => {
    setViewMode('my-feed');
    setSelectedGroupId(null);
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {!user ? (
        isRegistering ? (
          <Register onBackToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onRegisterClick={() => setIsRegistering(true)} />
        )
      ) : (
        <div>
          <header style={{ padding: '15px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Welcome, <strong>{user.username}</strong></span>
            <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '5px' }}>Logout</button>
          </header>
          
          <main style={{ display: 'flex', gap: '25px', padding: '25px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ flex: '1' }}>
              {/* מעבירים את הפונקציה החדשה ל-GroupList */}
              <GroupList user={user} onSelectGroup={handleGroupSelect} onShowMyFeed={handleShowMyFeed} />
            </div>

            <div style={{ flex: '2', background: '#fff', borderRadius: '15px', padding: '20px', minHeight: '400px' }}>
              {viewMode === 'my-feed' ? (
                <MyFeed user={user} currentUserId={user._id} />
              ) : viewMode === 'group' ? (
                <>
                  <h2>{selectedGroupName}</h2>
                  <PostsFeed user={user} groupId={selectedGroupId} currentUserId={user._id} />
                </>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <h1>Welcome, {user.username}! 👋</h1>
                  <p>Select a group or your feed to start.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;