import { Avatar, Dialog, IconButton, CircularProgress } from "@material-ui/core";

import "./StatusPreview.css"; // Add this new CSS file
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Authentication/auth";
import Cookies from "universal-cookie";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoClose, IoCloseCircle, IoCloseCircleSharp } from "react-icons/io5";
import { MdEdit, MdDelete, MdAccessTime } from "react-icons/md";
import { FaHeart, FaRegHeart, FaUserCircle } from "react-icons/fa";
import './StatusPreview.css';

function StatusPreview() {
  const cookies = new Cookies();
  const [status, setStatus] = useState("");
  const [status_id, setStatus_id] = useState("");
  const [user_id, setUser_id] = useState("");
  const [statusPath, setStatusPath] = useState("");
  const [caption, setCaption] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 15) + 1);

  const navigate = useNavigate();
  const { id } = useParams();
  
  const auth = useAuth();
  let options = {};

  if (!auth.social) {
    options = {
      headers: {
        Authorization: "Bearer " + cookies.get("token"),
        "Content-type": "application/json",
      },
    };
  } else {
    options = {
      withCredentials: true,
    };
  }

  const getStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8081/status/" + id, options);
      setStatus(res.data);
      setStatus_id(res.data.status_id);
      setUser_id(res.data.user_id);
      setStatusPath(res.data.statusPath);
      setCaption(res.data.caption);
      setTimestamp(res.data.timestamp);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching status:", err);
      setError("Failed to load story. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
  }, [id]);

  const deleteStatus = async () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      try {
        await axios.delete("http://localhost:8081/status/" + id, options);
        navigate("/home");
      } catch (err) {
        console.error("Error deleting status:", err);
        alert("Failed to delete the story. Please try again.");
      }
    }
  };

  const goBack = () => {
    navigate("/home");
  };

  const toggleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formatTimeElapsed = (timestamp) => {
    const statusTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - statusTime;
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  // Check if current user is the owner of the status
  const isOwner = localStorage.getItem("user_id") === (user_id && user_id.id);

  if (error) {
    return (
      <Dialog open={true}>
        <div className="status-preview-error">
          <div>
            <IoCloseCircle className="error-icon" />
            <h3>{error}</h3>
            <button 
              className="back-button"
              onClick={goBack}
            >
              Go Back
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <div>
      <Dialog
        open={true}
        maxWidth="md"
        fullWidth
        className="status-preview-dialog"
      >
        {loading ? (
          <div className="status-preview-loading">
            <CircularProgress color="inherit" />
            <p>Loading story...</p>
          </div>
        ) : (
          <>
            <div className="status-preview-header">
              <div className="user-info">
                {user_id.profilePic ? (
                  <Avatar src={user_id.profilePic} className="user-avatar" />
                ) : (
                  <FaUserCircle className="user-avatar-icon" />
                )}
                <div className="user-details">
                  <h3>{user_id.username}</h3>
                  <span className="time-elapsed">
                    <MdAccessTime className="time-icon" />
                    {formatTimeElapsed(timestamp)}
                  </span>
                </div>
              </div>
              <IconButton 
                className="close-preview-button" 
                onClick={goBack}
                aria-label="Close preview"
              >
                <IoCloseCircleSharp />
              </IconButton>
            </div>
            
            <div className="status-preview-content">
              <div className="status-image-container">
                <img src={statusPath} alt="Status" className="status-preview-image" />
              </div>
              
              {caption && (
                <div className="status-caption">
                  <p>{caption}</p>
                </div>
              )}
            </div>
            
            <div className="status-preview-footer">
              <div className="status-actions">
                <button
                  className={`like-button ${liked ? 'liked' : ''}`}
                  onClick={toggleLike}
                >
                  {liked ? (
                    <FaHeart className="action-icon heart-filled" />
                  ) : (
                    <FaRegHeart className="action-icon" />
                  )}
                  <span>{likeCount}</span>
                </button>
              </div>
              
              {isOwner && (
                <div className="owner-actions">
                  <Link to={`/status/update/${id}`} className="edit-link">
                    <button className="edit-button">
                      <MdEdit className="action-icon" />
                      Edit
                    </button>
                  </Link>
                  <button 
                    className="delete-button"
                    onClick={deleteStatus}
                  >
                    <MdDelete className="action-icon" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default StatusPreview;