import React, { useState } from 'react';
import $ from 'jquery';

function Login({ onLoginSuccess, onRegisterClick }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        
        $.ajax({
            // חשוב: להוסיף את הפורט המלא של ה-Backend
            url: 'http://localhost:5001/api/users/login', 
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: (response) => {
                console.log("Login successful, user data:", response);
    
                // שמירת הטוקן ב-localStorage כדי שהדפדפן "יזכור" אותו
                if (response.token) {
                    localStorage.setItem('token', response.token); 
                }
                onLoginSuccess(response);
                
                alert("Welcome, " + response.username + "!");
                
                if (onLoginSuccess) {
                    onLoginSuccess(response); 
                }
            },
            error: (err) => {
                console.error("Login error:", err);
                alert("Login failed: Invalid username or password");
            }
        });
    };

    return (
        <div className="login-container" style={{ 
            padding: '30px', border: '1px solid #ddd', borderRadius: '15px', 
            maxWidth: '350px', margin: '100px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' 
        }}>
            <h2 style={{ color: '#333' }}>Social Network Login</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
                        required
                    />
                </div>
                <button type="submit" style={{ 
                    width: '100%', padding: '10px', backgroundColor: '#9370DB', 
                    color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}>
                    Login
                </button>
            </form>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>Don't have an account?</p>
                <button 
                    onClick={onRegisterClick} 
                    style={{ background: 'none', border: 'none', color: '#9370DB', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                    Register here
                </button>
            </div>
        </div>
    );
}

export default Login;