
import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Project, UserProfile, Notification } from '../types';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  project: Project | null;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClearNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, project, notifications, onNotificationClick, onClearNotifications }) => {
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Generic hook to close dropdown when clicking outside
  const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, close: () => void) => {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          close();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, close]);
  };

  useOutsideAlerter(userDropdownRef, () => setUserDropdownOpen(false));
  useOutsideAlerter(notificationDropdownRef, () => setNotificationDropdownOpen(false));

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{project ? project.projectName : 'Dashboard'}</h1>
          <p className="text-sm text-gray-500">
            {project ? `Managed by ${project.projectManager}` : 'Select a project from the sidebar'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border">
                <div className="p-3 flex justify-between items-center border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && 
                    <button onClick={onClearNotifications} className="text-xs text-brand-primary hover:underline">Mark all as read</button>
                  }
                </div>
                 <ul className="py-1 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                        <li key={n.id}>
                          <a href="#" onClick={(e) => { e.preventDefault(); onNotificationClick(n); setNotificationDropdownOpen(false); }} className={`block px-4 py-3 hover:bg-gray-100 ${!n.read ? 'bg-blue-50' : ''}`}>
                              <p className="text-sm text-gray-700">{n.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                          </a>
                        </li>
                    )) : (
                        <li className="px-4 py-3 text-sm text-center text-gray-500">No new notifications</li>
                    )}
                  </ul>
              </div>
            )}
          </div>
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
            >
              <img src={user.picture} alt="User" className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-sm font-medium text-left text-gray-800">{user.name}</p>
                <p className="text-xs text-left text-gray-500">{user.email}</p>
              </div>
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                <button
                  onClick={onLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
