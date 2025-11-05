import React, { useState } from "react";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "student":
        return "/student-dashboard";
      case "alumni":
        return "/alumni-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src={logo} alt="GGI Alumni Network" className="h-16 w-auto transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="relative px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
            </Link>

            {user && (
              <>
                <Link 
                  to="/alumni" 
                  className="relative px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Alumni</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
                <Link 
                  to="/jobs" 
                  className="relative px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Jobs</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
                <Link 
                  to="/events" 
                  className="relative px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Events</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
                <Link
                  to={getDashboardLink()}
                  className="relative px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
                
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <span className="relative z-10">Logout</span>
                    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-3 ml-4">
                <Link 
                  to="/login" 
                  className="relative px-5 py-2.5 rounded-lg font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10">Login</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
                <Link
                  to="/register"
                  className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Register</span>
                  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
            <Link
              to="/"
              className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/alumni"
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Alumni
                </Link>
                <Link
                  to="/jobs"
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/events"
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {/* Mobile User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 mx-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{user.name}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="relative w-full text-left px-4 py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Logout</span>
                  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="relative block px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Register</span>
                  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
