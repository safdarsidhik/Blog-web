import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import BlogPage from './BlogPage'; // Import BlogPage component

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [role, setRole] = useState('user'); // default to 'user'
  const [isLogin, setIsLogin] = useState(true); // Flag to toggle between login and registration
  const [roleSelection, setRoleSelection] = useState('user'); // Role selection (user/admin)

  // Handle submit for Login/Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        // Logging in the user
        response = await axios.post('http://localhost:5000/api/login', { email, password });
        const { user } = response.data;
        setToken(user); // Set user data
        setRole(user.role); // Set the role from the backend
        localStorage.setItem('user', JSON.stringify(user)); // Save user data to localStorage
      } else {
        // Registering the user (with the selected role)
        response = await axios.post('http://localhost:5000/api/register', { username, email, password, role: roleSelection });
        alert('Registration successful! You can now log in.');
        setIsLogin(true); // Switch to login form after successful registration
      }
    } catch (error) {
      alert(error.response ? error.response.data.error : 'An error occurred');
    }
  };

  // Logout function to clear token and role
  const logout = () => {
    setToken('');
    setRole('user');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div>
        {!token ? (
          <>
            <h1>{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Role selection dropdown (only visible when registering) */}
              {!isLogin && (
                <div>
                  <label>Role: </label>
                  <select onChange={(e) => setRoleSelection(e.target.value)} value={roleSelection}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Create a new account' : 'Already have an account? Login'}
            </button>
          </>
        ) : (
          <Navigate to="/blog" />
        )}

        <Routes>
          <Route
            path="/"
            element={!token ? (
              <div>
                <h2>Please Log In</h2>
              </div>
            ) : (
              <Navigate to="/blog" />
            )}
          />
          <Route
            path="/blog"
            element={
              token ? (
                <div>
                  {role === 'admin' ? (
                    <div>
                      <BlogPage token={token} role={role} logout={logout} />
                      <button onClick={logout}>Logout</button>
                    </div>
                  ) : (
                    <div>
                      <h2>Blog Posts</h2>
                      <BlogPage token={token} role={role} logout={logout} />
                    </div>
                  )}
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
