import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import Login from './Login';
import Register from './Register'; 
import GroupList from './GroupList';
import PostsFeed from './PostsFeed';
import MyFeed from './MyFeed';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState(null);

  // פונקציה לרענון נתוני הקבוצה מהשרת (ללא רענון דף)
  const refreshSelectedGroup = () => {
    if (!selectedGroup) return;
    $.ajax({
      // שיניתי את הנתיב כדי למשוך את הקבוצה הזו ספציפית
      url: `http://localhost:5001/api/groups/${selectedGroup._id}`, 
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + user.token },
      success: (updatedGroup) => {
        // עכשיו נעדכן את הקבוצה ב-State
        setSelectedGroup(updatedGroup); 
      },
      error: (err) => console.error("Error refreshing group", err)
    });
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    $.ajax({
      url: 'http://localhost:5001/api/users/me',
      headers: { 'Authorization': 'Bearer ' + token },
      success: (userData) => {
        setUser({ ...userData, token });
        setIsLoading(false);
      },
      error: () => {
        localStorage.removeItem('token');
        setIsLoading(false);
      }
    });
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setUser(null);
    setViewMode('dashboard');
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group) => {
    setViewMode('group');
    setSelectedGroup(group);
  };

  const handleShowMyFeed = () => {
    setViewMode('my-feed');
    setSelectedGroup(null);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {!user ? (
        isRegistering ? (
          <Register onBackToLogin={() => setIsRegistering(false)} />
        ) : (
          <Login onLoginSuccess={(userData) => setUser(userData)} onRegisterClick={() => setIsRegistering(true)} />
        )
      ) : (
        <div>
          <header style={{ padding: '15px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Welcome, <strong>{user.username}</strong></span>
            <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '5px' }}>Logout</button>
          </header>
          
          <main style={{ display: 'flex', gap: '25px', padding: '25px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ flex: '1' }}>
              <GroupList user={user} onSelectGroup={handleGroupSelect} onShowMyFeed={handleShowMyFeed} />
            </div>

            <div style={{ flex: '2', background: '#fff', borderRadius: '15px', padding: '20px', minHeight: '400px' }}>
              {viewMode === 'my-feed' ? (
                <MyFeed user={user} currentUserId={user._id} />
              ) : viewMode === 'group' && selectedGroup ? (
                <>
                  <h2>{selectedGroup.name}</h2> 
                  <PostsFeed 
                      user={user} 
                      group={selectedGroup} 
                      currentUserId={user._id}
                      onRefresh={refreshSelectedGroup} // העברת הפונקציה לרענון חכם
                  />
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