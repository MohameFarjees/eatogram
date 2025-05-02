import React, { useState, useEffect, useRef } from "react";
import "./NavBar.css";
import { Grid } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { Link } from "react-router-dom";
import { FaRegBell } from "react-icons/fa";

import app_logo from "../../images/Flavorgram_copy.png";
import home from "../../images/home.svg";
import message from "../../images/message.svg";
import find from "../../images/find.svg";
import pp from "../../images/pp1.png";

import Notifications from "../Notification/Notifications";

export default function NavBar() {
  const [notificationsIsOpen, setNotificationsIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleNotifications = () => {
    setNotificationsIsOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo-container">
          <Link to="/home">
            <img className="navbar-logo" src={app_logo} alt="Flavorgram Logo" />
          </Link>
        </div>

        <div className="navbar-search-container">
          <input type="text" className="navbar-search" placeholder="Search" />
        </div>

        <div className="navbar-menu">
          <Link to="/home" className="navbar-menu-item">
            <img className="navbar-icon" src={home} alt="Home" />
          </Link>

          <Link to="/messenger" className="navbar-menu-item">
            <img className="navbar-icon" src={message} alt="Messages" />
          </Link>

          <Link to="/ExplorePage" className="navbar-menu-item">
            <img className="navbar-icon" src={find} alt="Explore" />
          </Link>

          <div className="navbar-notification-container" ref={dropdownRef}>
            <button 
              className="navbar-menu-item notification-btn"
              onClick={toggleNotifications}
            >
              <FaRegBell className="navbar-icon bell-icon" title="Notifications" />
            </button>
            
            {notificationsIsOpen && (
              <div className="notifications-dropdown">
                <Notifications />
              </div>
            )}
          </div>

          <Link to="/profile" className="navbar-menu-item">
            <Avatar src={pp} className="navbar-avatar" alt="Profile" />
          </Link>

          <Link to="/logout" className="navbar-menu-item">
            <button className="navbar-logout-btn">Logout</button>
          </Link>
        </div>
      </div>
    </div>
  );
}