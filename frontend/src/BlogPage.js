import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BlogPage = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) {
        setError('No valid token found.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (err) {
        // Improved error logging
        console.error('Error fetching posts:', err);
        setError(`Error fetching posts: ${err.response ? err.response.data.error : err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Blog Posts</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};

export default BlogPage;
