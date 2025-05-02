import React, { useEffect, useState } from "react";
import { Dialog, Avatar } from "@material-ui/core";
import { IoCloseCircleSharp } from "react-icons/io5";
import axios from "axios";
import Cookies from "universal-cookie";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/auth";
import "./StatusUpdate.css"; // We'll create this file separately

function StatusUpdate() {
  const cookies = new Cookies();
  const [status, setStatus] = useState("");
  const [status_id, setStatus_id] = useState("");
  const [user_id, setUser_id] = useState("");
  const [statusPath, setStatusPath] = useState("");
  const [caption, setCaption] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams();
  
  // Configure request options based on authentication type
  const options = !auth.social
    ? {
        headers: {
          Authorization: "Bearer " + cookies.get("token"),
          "Content-type": "application/json",
        },
      }
    : { withCredentials: true };

  // Get status data from backend
  const getStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/status/${id}`, options);
      const data = response.data;
      
      setStatus(data);
      setStatus_id(data.status_id);
      setUser_id(data.user_id);
      setStatusPath(data.statusPath);
      setCaption(data.caption);
      setTimestamp(data.timestamp);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load status. Please try again.");
      setIsLoading(false);
      console.error("Error fetching status:", err);
    }
  };

  // Load status data on component mount
  useEffect(() => {
    getStatus();
  }, [id]);

  // Delete status function
  const deleteStatus = async () => {
    try {
      await axios.delete(`http://localhost:8081/status/${id}`, options);
      navigate("/home");
    } catch (err) {
      setError("Failed to delete status. Please try again.");
      console.error("Error deleting status:", err);
    }
  };

  // Update status function
  const updateStatus = async () => {
    const newStatus = {
      user_id: { id: localStorage.getItem("user_id").toString() },
      statusPath,
      caption,
      timestamp,
    };
    
    try {
      await axios.put(`http://localhost:8081/status/${id}`, newStatus, options);
      navigate("/home");
    } catch (err) {
      setError("Failed to update status. Please try again.");
      console.error("Error updating status:", err);
    }
  };

  // Navigate back to home
  const goBack = () => {
    navigate("/home");
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading status...</p>
      </div>
    );
  }

  return (
    <Dialog 
      open={true}
      className="status-dialog"
      maxWidth="sm"
      fullWidth={true}
      PaperProps={{
        className: "status-dialog-paper",
      }}
    >
      {/* Dialog Header */}
      <div className="status-dialog-header">
        <div className="user-info">
          {user_id && user_id.profileImageUrl ? (
            <Avatar src={user_id.profileImageUrl} className="user-avatar" />
          ) : (
            <Avatar className="user-avatar">{user_id && user_id.username ? user_id.username.charAt(0).toUpperCase() : '?'}</Avatar>
          )}
          <h2>{user_id && user_id.username ? user_id.username : 'User'}</h2>
        </div>
        <button
          className="close-button"
          onClick={goBack}
          aria-label="Close"
        >
          <IoCloseCircleSharp />
        </button>
      </div>

      {/* Status Image */}
      <div className="status-image-container">
        {statusPath ? (
          <img 
            src={statusPath} 
            alt="Status" 
            className="status-image" 
          />
        ) : (
          <div className="image-placeholder">Image not available</div>
        )}
      </div>

      {/* Caption Editor */}
      <div className="caption-container">
        <textarea
          className="caption-editor"
          placeholder="Edit your caption..."
          maxLength="100"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="character-count">
          {caption.length}/100
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="button button-secondary"
          onClick={goBack}
        >
          Cancel
        </button>
        <button 
          className="button button-danger"
          onClick={deleteStatus}
        >
          Delete
        </button>
        <button 
          className="button button-primary"
          onClick={updateStatus}
        >
          Save Changes
        </button>
      </div>
    </Dialog>
  );
}

export default StatusUpdate;