import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './PostComment';

const BlogPage = ({ token, role }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // Track comments and new comment input per postId
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);

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

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data,
      }));
    } catch (err) {
      setError(`Error fetching comments: ${err.response ? err.response.data.error : err.message}`);
    }
  }, [token]);

  // Submit a new comment for a post
  const handleSubmitComment = async (postId) => {
    if (!newComment[postId]) {
      setError('Please enter a comment.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content: newComment[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment((prevComments) => ({
        ...prevComments,
        [postId]: '', // Clear the input field for this post
      }));
      fetchComments(postId); // Re-fetch comments after submitting
    } catch (err) {
      setError(`Error submitting comment: ${err.response ? err.response.data.error : err.message}`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Toggle comment box visibility for a post
  const toggleCommentBox = (postId) => {
    if (activeCommentBox === postId) {
      setActiveCommentBox(null); // Close the comment box
    } else {
      setActiveCommentBox(postId); // Open the comment box
      fetchComments(postId); // Fetch comments when the comment box is opened
    }
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
                  <button onClick={() => handleEditPost(post.id, editingPost)} className="save-btn">Save</button>
                  <button onClick={() => setEditingPost(null)} className="cancel-btn">Cancel</button>
                </div>
              )}

              {/* Comment Section */}
              <div className="comment-section">
                <h4>Comments</h4>
                <div>
                  {comments[post.id] && comments[post.id].length > 0 ? (
                    <div>
                      {comments[post.id].map((comment) => (
                        <div key={comment.id} className="comment">
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>

                {/* Add Comment Button */}
                <button onClick={() => toggleCommentBox(post.id)} className="add-comment-btn">
                  {activeCommentBox === post.id ? 'Cancel' : 'Add Comment'}
                </button>

                {/* Comment Input Box */}
                {activeCommentBox === post.id && (
                  <div className="comment-input">
                    <textarea
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      placeholder="Add your thoughts..."
                      className="edit-textarea"
                    />
                    <button onClick={() => handleSubmitComment(post.id)} className="save-btn">
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default BlogPage;
