import { useEffect, useState } from "react";
import { useAuth } from "../Authentication/auth";
import NavBar from "../NavBar/NavBar";
import { FaCheck, FaRegComment, FaTimes, FaBellSlash } from "react-icons/fa";
import axios from "axios";
import Cookies from "universal-cookie";
import BeatLoader from "react-spinners/BeatLoader";
import moment from "moment";

export default function Notifications() {
  const auth = useAuth();
  const [notifications, setNotifications] = useState([]);
  const cookies = new Cookies();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNotifications();
  }, []);

  const emoji = {
    love: "😍",
    hate: "🤮",
    drool: "🤤",
  };

  let options = !auth.social
    ? {
        headers: {
          Authorization: "Bearer " + cookies.get("token"),
          "Content-type": "application/json",
        },
      }
    : { withCredentials: true };

  async function getNotifications() {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8081/notification?id=" + auth.user.id,
        options
      );
      setNotifications(res.data.length === 0 ? null : [...res.data]);
    } catch (err) {
      if (err?.response?.status === 404) setNotifications(null);
      else console.error(err);
    }
    setLoading(false);
  }

  function getLink(n, rel) {
    return n.links.find((link) => link.rel === rel)?.href;
  }

  async function deleteNotificationHandler(link) {
    try {
      await axios.delete(link, options);
      getNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAllNotifications(link) {
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;
    try {
      await axios.delete(link + "?id=" + auth.user.id, options);
      getNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <BeatLoader size={10} color="#3B82F6" />
        </div>
      ) : notifications ? (
        <div className="space-y-3">
          {notifications.map((n, index) => (
            <div 
              key={index}
              className="relative flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-shrink-0 mt-1 mr-3 text-blue-500">
                <FaRegComment className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">@{n.notification_sender}</span>
                  <span className="text-lg">
                    {n.label === "love" ? emoji.love : 
                     n.label === "hate" ? emoji.hate : emoji.drool}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{n.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {moment(n.timestamp).fromNow()}
                </p>
              </div>
              <button
                onClick={() => deleteNotificationHandler(getLink(n, "delete"))}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Remove notification"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 mb-4 rounded-full bg-green-100 text-green-500">
            <FaCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">You have no new notifications</p>
        </div>
      )}

      {notifications && notifications.length > 0 && !loading && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => deleteAllNotifications(getLink(notifications[0], "delete-all"))}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FaBellSlash className="mr-2" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}