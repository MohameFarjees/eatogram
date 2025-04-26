import React, { useState } from "react";
import "./NavBar.css";
import { Grid } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { Link } from "react-router-dom";

// Import images
import app_logo from "../../images/Flavorgram_copy.png";
import home from "../../images/home.svg";
import message from "../../images/message.svg";
import find from "../../images/find.svg";
import react from "../../images/love.svg";
import pp from "../../images/pp1.png";

// Import components
import Notifications from "../Notification/Notifications";

export default function NavBar() {
  const [notificationsIsOpen, setNotificationsIsOpen] = useState(false);

  function notificationsClickHandler() {
    setNotificationsIsOpen(!notificationsIsOpen);
  }

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo-container">
          <Link to="/home">
            <img className="navbar-logo" src={app_logo} alt="Flavorgram Logo" />
          </Link>
        </div>

        <div className="navbar-search-container">
          <input
            type="text"
            className="navbar-search"
            placeholder="Search"
          />
        </div>

        <div className="navbar-menu">
          <Link to="/home" className="navbar-menu-item">
            <img className="navbar-icon" src={home} alt="Home" />
          </Link>
          
          <Link to="/messenger" className="navbar-menu-item">
            <img className="navbar-icon" src={message} alt="Messages" />
          </Link>
          
          <Link to="#" className="navbar-menu-item">
            <img className="navbar-icon" src={find} alt="Explore" />
          </Link>
          
          <button className="navbar-menu-item notification-btn" onClick={notificationsClickHandler}>
            <img className="navbar-icon" src={react} alt="Notifications" />
          </button>
          
          <Link to="/profile" className="navbar-menu-item">
            <Avatar src={pp} className="navbar-avatar" alt="Profile" />
          </Link>
          
          <Link to="/logout" className="navbar-menu-item">
            <button className="navbar-logout-btn">Logout</button>
          </Link>
        </div>
      </div>
      
      {notificationsIsOpen && (
        <div className="notifications-dropdown">
          <Notifications />
        </div>
      )}
    </div>
  );
}