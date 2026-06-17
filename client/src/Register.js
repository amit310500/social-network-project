import React, { useState } from 'react';
import $ from 'jquery';

function Register({ onBackToLogin }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = (e) => {
        e.preventDefault();
        
        // שליחת הנתונים לשרת - כולל שדה האימייל החדש
        $.ajax({
            url: 'http://localhost:5001/api/users/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password }), // הוספנו את email כאן
            success: (response) => {
                alert("Registration successful! You can now login.");
                onBackToLogin(); 
            },
            error: (err) => {
                const errorMsg = err.responseJSON ? err.responseJSON.message : "Registration failed";
                alert(errorMsg);
            }
        });
    };

    return (
        <div className="register-container" style={{ 
            padding: '30px', 
            border: '1px solid #ddd', 
            borderRadius: '15px', 
            maxWidth: '350px',
            margin: '100px auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            backgroundColor: '#fff'
        }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Create Account</h2>
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Choose Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                {/* שדה אימייל חדש */}
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="password" 
                        placeholder="Choose Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                <button type="submit" style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#9370DB', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}>
                    Register
                </button>
            </form>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button 
                    onClick={onBackToLogin} 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#9370DB', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                    }}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}

export default Register;