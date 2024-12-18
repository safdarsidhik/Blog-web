import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostComments = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    // Fetch the comments when the component mounts
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/posts/${postId}/comments`
                );
                setComments(response.data); // Update state with fetched comments
                setError(''); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Failed to fetch comments');
            }
        };

        fetchComments();
    }, [postId]); // Re-fetch comments whenever the postId changes

    // Handle new comment submission
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            setError('Comment content is required');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5000/api/posts/${postId}/comments`,
                { content: newComment }
            );
            console.log('Comment added:', response.data);

            // Add the new comment to the state to update the UI without re-fetching
            setComments([...comments, { content: newComment }]);

            // Clear the input field and reset error state
            setNewComment('');
            setError('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment');
        }
    };

    return (
       <div>
         <div>
            

            {/* Comment input form */}
            <div>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment"
                ></textarea>
                <button onClick={handleAddComment}>Add Comment</button>
            </div>
        </div>
        <div>
            <h3>Comments</h3>
            {error && <p>{error}</p>}
            <ul>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <li key={index}>{comment.content}</li>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </ul>
        </div>
       </div>
    );
};

export default PostComments;
