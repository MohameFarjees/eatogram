import { Avatar, Dialog, CircularProgress, Tooltip, IconButton } from "@material-ui/core";
import "./StatusBar.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Authentication/auth";
import Cookies from "universal-cookie";
import { Link, useNavigate } from "react-router-dom";
import { storage } from "./config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import ImageIcon from '@material-ui/icons/Image';


function StatusBar() {
  const [status, setStatus] = useState([]);
  const [user_id, setUser_id] = useState("");
  const cookies = new Cookies();
  const [show, setShow] = useState(false);
  const [uploadImg, setUploadImg] = useState(null);
  const [image, setImage] = useState();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  var [timestamp, setTimestamp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [state, setState] = useState(false);

  var currentDate = new Date().toISOString();
  const objectId = null;

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
    if (localStorage.getItem("user_id")) {
      try {
        const res = await axios.get("http://localhost:8081/status", options);
        setStatus(res.data);
        setUser_id(res.data.user_id);
        console.log(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching status:", err);
        setLoading(false);
      }
    } else {
      setStatus(null);
      setLoading(false);
    }
  };

  const deleteStatus = async (id) => {
    try {
      await axios.delete("http://localhost:8081/status/" + id, options);
      getStatus();
    } catch (err) {
      console.error("Error deleting status:", err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("user_id")) {
      localStorage.setItem("user_id", auth.user.id);
    }
    getStatus();
  }, [state]);

  const openDialog = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setUploadImg(URL.createObjectURL(file));
      setShow(true);
    }
  };

  const handleClose = () => {
    setShow(false);
    setUploadImg(null);
    setCaption("");
  };

  const uploadToFirebase = async () => {
    setLoading(true);
    
    try {
      const imageRef = ref(storage, `images/${image.name}`);
      console.log(imageRef);

      timestamp = currentDate;

      await uploadBytes(imageRef, image);
      console.log("Uploaded images");

      const url = await getDownloadURL(ref(storage, `images/${image.name}`));
      console.log(url);

      const newStatus = {
        user_id: { id: localStorage.getItem("user_id").toString() },
        statusPath: url,
        caption,
        timestamp,
      };
      
      await axios.post("http://localhost:8081/status", newStatus, options);
      setState(!state);
      setShow(false);
      setLoading(false);
    } catch (err) {
      console.error("Error uploading status:", err);
      setLoading(false);
    }
  };
  
  const currentTime = new Date();

  const filteredItems = status.filter((item) => {
    const itemTime = new Date(item.timestamp);
    const timeDifference = currentTime - itemTime;
    const timeThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return timeDifference < timeThreshold;
  });

  // Calculate time elapsed for each status
  const getTimeElapsed = (timestamp) => {
    const statusTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - statusTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    
    if (diffHrs >= 1) {
      return `${diffHrs}h ago`;
    } else {
      return diffMins <= 0 ? 'Just now' : `${diffMins}m ago`;
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollLeft > 0) {
      setIsScrolling(true);
    } else {
      setIsScrolling(false);
    }
  };

  return (
    <div className="statusbar-wrapper">
      <Dialog
        onClose={handleClose}
        aria-labelledby="simple-dialog-title"
        open={show}
        maxWidth="md"
        className="status-dialog"
      >
        <div className="status-dialog-container">
          <div className="story_add_header">
            <span>Add New Story</span>
            <IconButton className="close-button" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
          
          <div className="status-content">
            <img src={uploadImg} className="upload_preview" alt="Preview" />
            
            <div className="caption-container">
              <textarea
                className="edit_add_textbox"
                placeholder="Enter a caption... (max 100 characters)"
                maxLength="100"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="caption-counter">
                {caption.length}/100
              </div>
            </div>
            
            <div className="status-actions">
              <button
                className="upload_button"
                onClick={uploadToFirebase}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>
                    <SendIcon className="button-icon" />
                    Share Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <div className="statusbar_container">
        <div className={`status-gradient ${isScrolling ? 'scrolling' : ''}`}>
          <div className="fileupload">
            <label htmlFor="file-upload-status" className="upload-label">
              <div className="add-status-button">
                <AddCircleIcon className="add-icon" />
                <span className="add-text">Add Story</span>
              </div>
            </label>
            <input
              type="file"
              hidden
              id="file-upload-status"
              accept="image/*"
              onChange={openDialog}
            />
          </div>
        </div>

        <div 
          className="status-scroll-container"
          onScroll={handleScroll}
        >
          {loading && status.length === 0 ? (
            <div className="status-loading">
              <CircularProgress size={30} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="no-status">
              <ImageIcon className="no-status-icon" />
              <p>No stories available</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={index} className="status-item">
                <Link 
                  to={`/status/viewOne/${JSON.stringify(item.status_id).replace(/\"/g, '')}`} 
                  className="status-link"
                >
                  <Tooltip title={item.caption || `${item.user_id.username}'s story`} placement="bottom">
                    <div className="status">
                      <div
                        className="statusbar_status pulse"
                        style={{ backgroundImage: `url(${item.statusPath})` }}
                      >
                        <div className="status-time-badge">
                          {getTimeElapsed(item.timestamp)}
                        </div>
                      </div>
                      <div className="statusbar_text">
                        {item.user_id.username}
                      </div>
                    </div>
                  </Tooltip>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusBar;