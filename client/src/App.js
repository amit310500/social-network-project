import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import Login from './Login';
import Register from './Register'; 
import GroupList from './GroupList';
import PostsFeed from './PostsFeed';
import MyFeed from './MyFeed';
import GroupStats from './GroupStats';
import Profile from './Profile'; // הוספנו את הייבוא
import { FaHome } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stats, setStats] = useState({ postsByMonth: [], postsByGroup: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  // פונקציה לרענון נתוני הקבוצה מהשרת
  const refreshSelectedGroup = () => {
    if (!selectedGroup) return;
    $.ajax({
      url: `http://localhost:5001/api/groups/${selectedGroup._id}`, 
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + user.token },
      success: (updatedGroup) => {
        setSelectedGroup(prev => ({ ...prev, ...updatedGroup })); 
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

        $.ajax({
            url: 'http://localhost:5001/api/posts/stats',
            headers: { 'Authorization': 'Bearer ' + token },
            success: (data) => {
                setStats(data);
            },
            error: (err) => console.error("Error fetching stats", err)
        });
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
    $.ajax({
      url: `http://localhost:5001/api/groups/${group._id}`,
      headers: { 'Authorization': 'Bearer ' + user.token },
      success: (fullGroupData) => {
        setSelectedGroup(fullGroupData);
      }
    });
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaHome 
                  size={24} 
                  style={{ cursor: 'pointer', color: '#FFF' }} 
                  onClick={() => {
                    setViewMode('dashboard');
                    setSelectedGroup(null);
                  }} 
                  title="Go to Dashboard"
              />
              <span>Welcome, <strong>{user.username}</strong></span>
              {/* כפתור למעבר לפרופיל */}
              <span 
                onClick={() => setViewMode('profile')} 
                style={{ cursor: 'pointer', marginRight: '20px', textDecoration: 'underline', marginLeft: '10px' }}>
                My Profile
              </span>
            </div>
            
            <FiLogOut 
                size={24} 
                style={{ cursor: 'pointer', color: '#ff4d4d' }} 
                onClick={handleLogout} 
                title="Logout"
            />
          </header>
          
          <main style={{ display: 'flex', gap: '25px', padding: '25px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ flex: '1' }}>
              <GroupList 
                  user={user} 
                  onSelectGroup={handleGroupSelect} 
                  onShowMyFeed={handleShowMyFeed}
                  onDeleteSuccess={() => {
                    setViewMode('dashboard');
                    setSelectedGroup(null);
                    setRefreshKey(prev => prev + 1);
                    const token = localStorage.getItem('token');
                    $.ajax({
                      url: 'http://localhost:5001/api/posts/stats',
                      headers: { 'Authorization': 'Bearer ' + token },
                      success: (data) => setStats(data)
                    });
                  }} 
                />
            </div>

            <div style={{ flex: '2', background: '#fff', borderRadius: '15px', padding: '20px', minHeight: '400px' }}>
              {viewMode === 'profile' ? (
                <Profile user={user} onLogout={handleLogout} />
              ) : viewMode === 'my-feed' ? (
                <MyFeed key={refreshKey} user={user} currentUserId={user._id} />
              ) : viewMode === 'group' && selectedGroup ? (
                <>
                  <h2>{selectedGroup.name}</h2> 
                  <PostsFeed 
                      key={selectedGroup._id}
                      user={user} 
                      group={selectedGroup} 
                      currentUserId={user._id}
                      onRefresh={refreshSelectedGroup} 
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <h1>Welcome, {user.username}! 👋</h1>
                  <p>Select a group or your feed to start.</p>
                  {stats && stats.postsByMonth && stats.postsByMonth.length > 0 ? (
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h4>Posts per Month</h4>
                            <GroupStats data={stats.postsByMonth} type="bar" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h4>Posts per Group</h4>
                            <GroupStats data={stats.postsByGroup} type="pie" />
                        </div>
                      </div>
                    ) : (
                      <p>Loading statistics...</p>
                    )}
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