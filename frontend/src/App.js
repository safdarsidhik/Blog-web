import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import BlogPage from './BlogPage'; // Import BlogPage component
import './App.css';  // Import the CSS file


function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // Get token from localStorage
  const [role, setRole] = useState(localStorage.getItem('role') || 'user'); // Default to user
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
        localStorage.setItem('token', user.id); // Save token to localStorage
        localStorage.setItem('role', user.role); // Save role to localStorage
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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <div className="container">
        {/* If the user is not logged in, show login/register */}
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
          // If the user is logged in, show the welcome message and logout button
          <div>
            <h2>Welcome {role === 'admin' ? 'Admin' : 'User'}</h2>
            {/* <button onClick={logout}>Logout</button> Add logout button */}
            {/* Redirect to the blog page */}
            <Navigate to="/blog" />
          </div>
        )}

        {/* Routes for different pages */}
        <Routes>
          {/* Route for Login/Register page */}
          <Route
            path="/"
            element={!token ? (
              <div>
                <h2></h2>
              </div>
            ) : (
              <Navigate to="/blog" />
            )}
          />
          {/* Route for Blog Page */}
          <Route
            path="/blog"
            element={
              token ? (
                <div>
                  {role === 'admin' ? (
                    <div>
                      <BlogPage token={token} role={role} logout={logout} />
                      {/* <button onClick={logout}>Logout</button> */}
                    </div>
                  ) : (
                    <div>
                      {/* <h2>Blog Posts</h2> */}
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
