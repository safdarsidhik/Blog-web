import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css'; // Import your updated CSS file

const BlogPage = ({ token, role }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' }); // State for new post creation

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (err) {
      setError(`Error fetching posts: ${err.response ? err.response.data.error : err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPosts();
  }, [token, fetchPosts]);

  // Handle editing a post
  const handleEditPost = async (postId, updatedPost) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        updatedPost,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setEditingPost(null);
    } catch (err) {
      setError(`Error updating post: ${err.response ? err.response.data.error : err.message}`);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    try {
      if (!newPost.title || !newPost.content) {
        setError('Please fill out all fields.');
        return;
      }
      await axios.post(
        'http://localhost:5000/api/posts',
        newPost,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setNewPost({ title: '', content: '' }); // Reset form
    } catch (err) {
      setError(`Error creating post: ${err.response ? err.response.data.error : err.message}`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="blog-page container">
      <h2>Blog Posts</h2>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Create Post Section for Admin */}
          {role === 'admin' && (
            <div className="create-form card">
              <h4>Create New Post</h4>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Post Title"
                className="edit-input"
              />
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Post Content"
                className="edit-textarea"
              />
              <button onClick={handleCreatePost} className="save-btn">Create Post</button>
            </div>
          )}

          {/* Blog Posts */}
          {posts.map((post) => (
            <div key={post.id} className="card post-item">
              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </div>

              {/* Edit Post Button for Admin */}
              {role === 'admin' && (
                <button onClick={() => setEditingPost(post)} className="edit-btn">
                  Edit
                </button>
              )}

              {/* Edit Form */}
              {editingPost && editingPost.id === post.id && (
                <div className="edit-form">
                  <h4>Edit Post</h4>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="edit-input"
                    placeholder="Post Title"
                  />
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="edit-textarea"
                    placeholder="Post Content"
                  />
                  <button onClick={() => handleEditPost(post.id, editingPost)} className="save-btn">
                    Save
                  </button>
                  <button onClick={() => setEditingPost(null)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default BlogPage;
