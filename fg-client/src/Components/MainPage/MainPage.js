import { Avatar, Dialog, CircularProgress, Menu, MenuItem, Snackbar } from "@material-ui/core";
import "./MainPage.css";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../Authentication/auth";
import Cookies from "universal-cookie";
import { Link, useNavigate } from "react-router-dom";
import { storage } from "../StatusBar/config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import uploadImage from "../../images/upload.png";
import { RiHeart3Line, RiHeart3Fill, RiChat1Line, RiShareForwardLine, RiBookmarkLine, RiBookmarkFill, RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaFacebook, FaWhatsapp, FaTwitter, FaEnvelope, FaLink, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Comment from "../Comment/Comment";
import NoPostsImage from "../../images/no-posts.png";
import Alert from '@mui/material/Alert';

function MainPage() {
  const [post, setPost] = useState([]);
  const [user_id, setUser_id] = useState("");
  const cookies = new Cookies();
  const [show, setShow] = useState(false);
  const [uploadImg, setUploadImg] = useState(null);
  const [image, setImage] = useState();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState();
  const [state, setState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [liked, setLiked] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [filterOption, setFilterOption] = useState("recent");
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [sharePostId, setSharePostId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [postsCache, setPostsCache] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState({});

  const currentDate = new Date().toISOString();

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

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const getPost = useCallback(async (skipCache = false) => {
    if (!localStorage.getItem("user_id")) {
      setPost([]);
      setLoading(false);
      return;
    }

    try {
      if (!skipCache && Object.keys(postsCache).length > 0 && isDataLoaded) {
        return;
      }

      setLoading(true);
      const res = await axios.get("http://localhost:8081/post", options);
      
      const newLikedState = {};
      const newBookmarkedState = {};
      
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach(item => {
          if (item && item.post_id) {
            newLikedState[item.post_id] = item.liked || false;
            newBookmarkedState[item.post_id] = item.bookmarked || false;
          }
        });
        
        setPost(res.data);
        
        const newCache = {};
        res.data.forEach(item => {
          if (item && item.post_id) {
            newCache[item.post_id] = item;
          }
        });
        setPostsCache(newCache);
      }
      
      setLiked(newLikedState);
      setBookmarked(newBookmarkedState);
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Error fetching posts:", err);
      showSnackbar("Failed to load posts. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [options, postsCache, isDataLoaded]);

  useEffect(() => {
    if (!localStorage.getItem("user_id") && auth.user && auth.user.id) {
      localStorage.setItem("user_id", auth.user.id);
    }
    getPost();
  }, [getPost, auth.user, state]);

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      const postToDelete = post.find(p => p.post_id === postId);
      
      if (!postToDelete) {
        throw new Error("Post not found");
      }
      
      await axios.delete(`http://localhost:8081/post/${postId}`, options);
      
      if (postToDelete.postPath) {
        const fileUrl = new URL(postToDelete.postPath);
        const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1]?.split('?')[0]);
        
        if (filePath) {
          const imageRef = ref(storage, filePath);
          await deleteObject(imageRef);
        }
      }
      
      setPost(prevPosts => prevPosts.filter(p => p.post_id !== postId));
      
      const newCache = {...postsCache};
      delete newCache[postId];
      setPostsCache(newCache);
      
      showSnackbar("Post deleted successfully");
    } catch (err) {
      console.error("Error deleting post:", err);
      showSnackbar("Failed to delete post. Please try again.", "error");
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const updatePostCaption = async () => {
    try {
      if (!editPostId || !editCaption) return;
      
      setLoading(true);
      
      const updatedPost = {
        caption: editCaption
      };
      
      await axios.put(`http://localhost:8081/post/${editPostId}`, updatedPost, options);
      
      setPost(prevPosts => 
        prevPosts.map(p => 
          p.post_id === editPostId ? {...p, caption: editCaption} : p
        )
      );
      
      setPostsCache(prev => ({
        ...prev,
        [editPostId]: {...prev[editPostId], caption: editCaption}
      }));
      
      showSnackbar("Caption updated successfully");
      
      setIsEditMode(false);
      setEditPostId(null);
      setEditCaption("");
    } catch (err) {
      console.error("Error updating caption:", err);
      showSnackbar("Failed to update caption. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
      setUploadImg(URL.createObjectURL(event.target.files[0]));
      setShow(true);
    }
  };

  const handleClose = () => {
    setShow(false);
    setUploadImg(null);
    setCaption("");
  };

  const handleMenuClick = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentPostId(null);
  };

  const handleShareMenuClick = (event, postId) => {
    event.stopPropagation();
    setShareMenuAnchorEl(event.currentTarget);
    setSharePostId(postId);
  };

  const handleShareMenuClose = () => {
    setShareMenuAnchorEl(null);
    setSharePostId(null);
  };

  const editPost = (postId) => {
    const postToEdit = post.find(p => p.post_id === postId);
    if (postToEdit) {
      setEditPostId(postId);
      setEditCaption(postToEdit.caption);
      setIsEditMode(true);
    }
    handleMenuClose();
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditPostId(null);
    setEditCaption("");
  };

  const handleSharePost = (platform) => {
    const postToShare = post.find(p => p.post_id === sharePostId);
    
    if (!postToShare) {
      handleShareMenuClose();
      return;
    }
    
    let shareUrl = '';
    const postUrl = `${window.location.origin}/post/${sharePostId}`;
    const text = `Check out this post: ${postToShare.caption}`;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out this post on Eatogram&body=${encodeURIComponent(text + '\n\n' + postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        showSnackbar("Link copied to clipboard!");
        handleShareMenuClose();
        return;
      default:
        handleShareMenuClose();
        return;
    }
    
    window.open(shareUrl, '_blank');
    handleShareMenuClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
      setUploadImg(URL.createObjectURL(e.dataTransfer.files[0]));
      setShow(true);
    }
  };

  const uploadToFirebase = async () => {
    if (!image) return;
    
    setUploading(true);
    const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);

    try {
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      
      const newPost = {
        user_id: { id: localStorage.getItem("user_id").toString() },
        postPath: url,
        caption,
        timestamp: currentDate,
      };

      await axios.post("http://localhost:8081/post", newPost, options);
      setState(prev => !prev);
      showSnackbar("Post uploaded successfully!");
      setUploading(false);
      setShow(false);
      setCaption("");
      setUploadImg(null);
    } catch (err) {
      console.error("Error uploading image:", err);
      setUploading(false);
      showSnackbar("Error uploading image. Please try again.", "error");
    }
  };

  const handleLike = async (postId) => {
    try {
      setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
      setShowLikeAnimation(prev => ({ ...prev, [postId]: true }));
      
      setTimeout(() => {
        setShowLikeAnimation(prev => ({ ...prev, [postId]: false }));
      }, 1000);
  
      setPostsCache(prev => ({
        ...prev,
        [postId]: { ...prev[postId], liked: !liked[postId] }
      }));
    } catch (err) {
      setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
      showSnackbar("Failed to update like status", "error");
    }
  };

  const handleBookmark = async (postId) => {
    try {
      setBookmarked(prev => ({...prev, [postId]: !prev[postId]}));
      
      setPostsCache(prev => ({
        ...prev,
        [postId]: {...prev[postId], bookmarked: !bookmarked[postId]}
      }));
    } catch (err) {
      setBookmarked(prev => ({...prev, [postId]: !prev[postId]}));
      showSnackbar("Failed to update bookmark status", "error");
    }
  };

  const currentTime = new Date();

  const getFilteredPosts = () => {
    if (!post || post.length === 0) return [];
    
    let filtered = [...post];
    
    if (filterOption === "recent") {
      filtered = filtered.filter(item => {
        if (!item || !item.timestamp) return false;
        const itemTime = new Date(item.timestamp);
        const timeDifference = currentTime - itemTime;
        const timeThreshold = 24 * 60 * 60 * 1000;
        return timeDifference < timeThreshold;
      });
    } else if (filterOption === "popular") {
      filtered.sort((a, b) => {
        if (!a || !a.timestamp) return 1;
        if (!b || !b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    } else if (filterOption === "all") {
      filtered.sort((a, b) => {
        if (!a || !a.timestamp) return 1;
        if (!b || !b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }
    
    return filtered;
  };

  const filteredItems = getFilteredPosts();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    const postDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  };

  const isCurrentUserPost = (postUserId) => {
    const currentUserId = localStorage.getItem("user_id");
    return postUserId && currentUserId && (postUserId.id === currentUserId || postUserId === currentUserId);
  };

  // Add this function inside your MainPage.js component - place it before the return statement

const loadSamplePosts = useCallback(async () => {
  try {
    // Only load sample posts if no posts exist
    if (post.length === 0 && !loading) {
      setLoading(true);
      
      const samplePosts = [
        {
          caption: "Perfect avocado toast with poached eggs and microgreens. My go-to brunch! #avocadotoast #brunchgoals",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample1.jpg?alt=media",
        },
        {
          caption: "Homemade sushi night! Made these California rolls and spicy tuna - not perfect but so delicious! #homemadesushi #cookingathome",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample2.jpg?alt=media",
        },
        {
          caption: "This ramen from the new place downtown is EVERYTHING. The broth simmered for 24 hours! #ramen #foodie",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample3.jpg?alt=media",
        },
        {
          caption: "First attempt at making sourdough bread from my own starter! So proud of how it turned out. #sourdough #homebaker",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample4.jpg?alt=media",
        },
        {
          caption: "Taco Tuesday done right! Carne asada, homemade guacamole, and corn tortillas. #tacotuesday #mexicanfood",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample5.jpg?alt=media",
        },
        {
          caption: "The most incredible tiramisu I've ever had - light, not too sweet, perfect coffee flavor. #dessert #italiandessert",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample6.jpg?alt=media",
        },
        {
          caption: "Farm-to-table experience at its best! This roasted vegetable platter features produce from local farms. #supportlocal #freshproduce",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample7.jpg?alt=media",
        },
        {
          caption: "Buttery, flaky croissants fresh from the oven. Worth waking up at 5am! #baking #frenchpastry",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample8.jpg?alt=media",
        },
        {
          caption: "Thai green curry with all the fixings - the perfect amount of spice and so aromatic! #thaifood #homecooking",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample9.jpg?alt=media",
        },
        {
          caption: "Summer berries galette with vanilla ice cream. Simple but so satisfying! #dessert #summerdessert",
          imageUrl: "https://firebasestorage.googleapis.com/v0/b/eatogram-sample.appspot.com/o/sample10.jpg?alt=media",
        }
      ];
      
      // Assign timestamps spread across the last 24 hours
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const postsWithAuth = samplePosts.map((post, index) => {
        // Create timestamps spread across the last 24 hours
        const postTime = new Date(oneDayAgo.getTime() + (index * (24 * 60 * 60 * 1000) / samplePosts.length));
        
        return {
          ...post,
          timestamp: postTime.toISOString(),
          post_id: `sample-${Date.now()}-${index}`,
          user_id: {
            id: localStorage.getItem("user_id"),
            username: auth.user?.username || "Eatogram User"
          },
          postPath: post.imageUrl,
          liked: Math.random() > 0.5,
          bookmarked: Math.random() > 0.7
        };
      });
      
      // Update state with sample posts
      setPost(postsWithAuth);
      
      // Update liked and bookmarked states
      const newLikedState = {};
      const newBookmarkedState = {};
      
      postsWithAuth.forEach(item => {
        if (item && item.post_id) {
          newLikedState[item.post_id] = item.liked || false;
          newBookmarkedState[item.post_id] = item.bookmarked || false;
        }
      });
      
      setLiked(newLikedState);
      setBookmarked(newBookmarkedState);
      
      // Add to cache
      const newCache = {};
      postsWithAuth.forEach(item => {
        if (item && item.post_id) {
          newCache[item.post_id] = item;
        }
      });
      setPostsCache(newCache);
      
      setIsDataLoaded(true);
      showSnackbar("Sample posts loaded successfully!");
    }
  } catch (err) {
    console.error("Error loading sample posts:", err);
  } finally {
    setLoading(false);
  }
}, [post.length, loading, auth.user, showSnackbar]);

// Add this useEffect to call the loadSamplePosts function
useEffect(() => {
  if (isDataLoaded && post.length === 0) {
    loadSamplePosts();
  }
}, [isDataLoaded, post.length, loadSamplePosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upload Dialog */}
      <Dialog 
        onClose={handleClose}
        open={show}
        maxWidth="sm"
        fullWidth
        className="rounded-lg"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Create New Post</h3>
            {uploading ? (
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md opacity-75 cursor-not-allowed">
                <CircularProgress size={20} style={{ color: 'white' }} />
              </button>
            ) : (
              <button 
                onClick={uploadToFirebase}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition duration-200"
              >
                Share
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/3 h-96 bg-gray-100 flex items-center justify-center">
              {uploadImg ? (
                <img 
                  src={uploadImg} 
                  className="w-full h-full object-cover" 
                  alt="Preview" 
                />
              ) : (
                <div className="text-center text-gray-500">
                  <span>No image selected</span>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/3 p-4">
              <div className="flex items-center mb-4">
                <Avatar className="mr-2">
                  <FaUserCircle />
                </Avatar>
                <span className="font-medium">{auth.user?.username || "User"}</span>
              </div>
              
              <textarea
                className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog
        open={isEditMode}
        onClose={cancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Edit Caption</h3>
            <div>
              <button 
                onClick={cancelEdit}
                className="px-4 py-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={updatePostCaption}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition duration-200"
              >
                Save
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <textarea
              className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Update your caption..."
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
          </div>
        </div>
      </Dialog>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filter Options */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
              filterOption === 'recent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setFilterOption('recent')}
          >
            Recent
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
              filterOption === 'popular' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setFilterOption('popular')}
          >
            Popular
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
              filterOption === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setFilterOption('all')}
          >
            All Posts
          </button>
        </div>

        
        
        {/* Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 mb-8 text-center cursor-pointer transition duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <img 
            src={uploadImage} 
            className="w-16 h-16 mx-auto mb-4 opacity-70" 
            alt="Upload" 
          />
          <p className="text-gray-600 mb-2">Drag and drop photos here</p>
          <p className="text-sm text-gray-500">or click to browse files</p>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={openDialog}
            accept="image/*"
          />
        </div>

        {/* Posts Container */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CircularProgress className="mb-4" />
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div 
                  key={item.post_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  layout
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                      <Avatar className="w-10 h-10 mr-3">
                        <FaUserCircle className="w-full h-full text-gray-400" />
                      </Avatar>
                      <div>
                        <div className="font-medium">{item.user_id?.username || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</div>
                      </div>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      onClick={(e) => handleMenuClick(e, item.post_id)}
                    >
                      <FiMoreHorizontal size={20} />
                    </button>
                  </div>
                  
                  {/* Post Image */}
                  <div 
                    className="relative aspect-square bg-gray-100 overflow-hidden"
                    onDoubleClick={() => handleLike(item.post_id)}
                  >
                    {item.postPath && (
                      <img
                        src={item.postPath}
                        alt={item.caption || "Post image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    
                    {/* Heart animation on double click */}
                    <AnimatePresence>
                      {showLikeAnimation[item.post_id] && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1.5 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <RiHeart3Fill className="text-pink-500" size={80} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Post Actions */}
                  <div className="flex justify-between p-3">
                    <div className="flex space-x-4">
                      <button 
                        className={`p-1 rounded-full transition duration-200 ${
                          liked[item.post_id] 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        onClick={() => handleLike(item.post_id)}
                      >
                        {liked[item.post_id] ? (
                          <RiHeart3Fill size={24} />
                        ) : (
                          <RiHeart3Line size={24} />
                        )}
                      </button>
                      <button 
                        className="p-1 text-gray-700 hover:text-gray-900 rounded-full transition duration-200"
                        onClick={() => setIsCommentOpen({
                          title: item.caption,
                          author: item.user_id.id,
                          post_id: item.post_id,
                        })}
                      >
                        <RiChat1Line size={24} />
                      </button>
                      <button 
                        className="p-1 text-gray-700 hover:text-gray-900 rounded-full transition duration-200"
                        onClick={(e) => handleShareMenuClick(e, item.post_id)}
                      >
                        <RiShareForwardLine size={24} />
                      </button>
                    </div>
                    <button 
                      className={`p-1 rounded-full transition duration-200 ${
                        bookmarked[item.post_id] 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      onClick={() => handleBookmark(item.post_id)}
                    >
                      {bookmarked[item.post_id] ? (
                        <RiBookmarkFill size={24} />
                      ) : (
                        <RiBookmarkLine size={24} />
                      )}
                    </button>
                  </div>
                  
                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <div className="text-sm font-medium mb-1">
                      {liked[item.post_id] ? "You liked this post" : "Be the first to like this post"}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-medium mr-1">{item.user_id?.username || "Unknown User"}</span> 
                      {item.caption}
                    </div>
                    <button 
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setIsCommentOpen({
                        title: item.caption,
                        author: item.user_id?.id || "Unknown",
                        post_id: item.post_id,
                      })}
                    >
                      View all comments
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img 
                src={NoPostsImage} 
                className="w-48 h-48 mb-6 opacity-80" 
                alt="No posts" 
              />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No posts yet</h3>
              <p className="text-gray-500 max-w-md">
                Be the first to share your delicious meal! Click the upload area above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Comment Modal */}
      {isCommentOpen != null && (
        <Comment
          postTitle={isCommentOpen.title}
          setIsCommentOpen={setIsCommentOpen}
          postId={isCommentOpen.post_id}
          postAuthor={isCommentOpen.author}
          commentResourceLink={"http://localhost:8081/comment"}
        />
      )}

      {/* Post Options Menu */}
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {isCurrentUserPost(post.find(p => p.post_id === currentPostId)?.user_id) && (
          <>
            <MenuItem 
              onClick={() => editPost(currentPostId)}
              className="flex items-center"
            >
              <RiEdit2Line className="mr-2 text-gray-700" /> 
              <span>Edit Caption</span>
            </MenuItem>
            <MenuItem 
              onClick={() => deletePost(currentPostId)}
              className="flex items-center"
            >
              <RiDeleteBin6Line className="mr-2 text-gray-700" /> 
              <span>Delete Post</span>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleMenuClose}>Cancel</MenuItem>
      </Menu>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchorEl}
        keepMounted
        open={Boolean(shareMenuAnchorEl)}
        onClose={handleShareMenuClose}
      >
        <MenuItem 
          onClick={() => handleSharePost('facebook')}
          className="flex items-center"
        >
          <FaFacebook className="mr-2 text-blue-600" /> 
          <span>Facebook</span>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSharePost('whatsapp')}
          className="flex items-center"
        >
          <FaWhatsapp className="mr-2 text-green-500" /> 
          <span>WhatsApp</span>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSharePost('twitter')}
          className="flex items-center"
        >
          <FaTwitter className="mr-2 text-blue-400" /> 
          <span>Twitter</span>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSharePost('email')}
          className="flex items-center"
        >
          <FaEnvelope className="mr-2 text-gray-600" /> 
          <span>Email</span>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSharePost('copy')}
          className="flex items-center"
        >
          <FaLink className="mr-2 text-gray-600" /> 
          <span>Copy Link</span>
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          className="shadow-lg"
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default MainPage;