import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch connections
      const connResponse = await fetch(
        API_ENDPOINTS.CONNECTIONS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const connData = await connResponse.json();
      if (connData.success) {
        setConnections(connData.data.filter((c) => c.status === "accepted"));
        setPendingRequests(connData.data.filter((c) => c.status === "pending"));
      }

      // Fetch recent jobs
      const jobResponse = await fetch(API_ENDPOINTS.JOBS);
      const jobData = await jobResponse.json();
      if (jobData.success) {
        setJobs(jobData.data.slice(0, 5));
      }

      // Fetch upcoming events
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS);
      const eventData = await eventResponse.json();
      if (eventData.success) {
        setEvents(eventData.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.CONNECTION_ACTION(requestId, 'accept'),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Connection request accepted!");
        fetchDashboardData();
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(data.message || "Your account is pending verification. Please wait for admin approval.");
        } else {
          alert(data.message || "Failed to accept request");
        }
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Error accepting request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.CONNECTION_ACTION(requestId, 'reject'),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Connection request declined!");
        fetchDashboardData();
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(data.message || "Your account is pending verification. Please wait for admin approval.");
        } else {
          alert(data.message || "Failed to decline request");
        }
      }
    } catch (error) {
      console.error("Error declining request:", error);
      alert("Error declining request");
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">Here's your learning journey today</p>
        </div>
        
        {/* Verification Status Alert */}
        {!user.isVerified && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Account Pending Verification:</strong> Your account is awaiting admin approval. 
                  You can view content but some actions are restricted until verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Connections</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{connections.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{pendingRequests.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Job Opportunities</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{jobs.length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{events.length}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Connection Requests</h2>
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <p className="font-semibold">{req.requester.name}</p>
                    {req.message && (
                      <p className="text-gray-600 text-sm">{req.message}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        disabled={processingRequest === req._id}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {processingRequest === req._id
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req._id)}
                        disabled={processingRequest === req._id}
                        className="btn-secondary text-sm disabled:opacity-50"
                      >
                        {processingRequest === req._id
                          ? "Processing..."
                          : "Decline"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Job Postings
                </h2>
                <p className="text-gray-600 text-sm mt-1">Latest opportunities for you</p>
              </div>
              <Link to="/jobs">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  View All →
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <Link key={job._id} to={`/jobs/${job._id}`} className="block">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {job.jobType}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        🏢 {job.company} • 📍 {job.location}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {job.description}
                      </p>
                      {job.applicationDeadline && (
                        <p className="text-xs text-gray-500 mt-2">
                          📅 Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">💼</span>
                  <p className="text-gray-600">No job postings available</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Upcoming Events
                </h2>
                <p className="text-gray-600 text-sm mt-1">Don't miss out on these events</p>
              </div>
              <Link to="/events">
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  View All →
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.slice(0, 5).map((event) => (
                  <Link key={event._id} to={`/events/${event._id}`} className="block">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {event.eventType}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        📍 {event.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                        <span>⏰ {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">📅</span>
                  <p className="text-gray-600">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                👤
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">🎓 Branch</p>
                <p className="text-sm font-semibold text-gray-800">{user.branch}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">📅 Graduation</p>
                <p className="text-sm font-semibold text-gray-800">{user.graduationYear}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/alumni" className="block">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <span>🔍</span> Find Alumni
                </button>
              </Link>
              <Link to="/jobs" className="block">
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <span>💼</span> Browse Jobs
                </button>
              </Link>
              <Link to="/events" className="block">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <span>📅</span> View Events
                </button>
              </Link>
            </div>
          </div>

          {/* Connections */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Connections ({connections.length})
            </h3>
            <div className="space-y-3">
              {connections.length > 0 ? (
                connections.slice(0, 5).map((conn) => {
                  const otherUser = conn.requester._id === user._id ? conn.recipient : conn.requester;
                  return (
                    <div key={conn._id} className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-r-xl pl-4 pr-3 py-3 hover:shadow-md transition-shadow">
                      <p className="font-semibold text-sm text-gray-800">{otherUser.name}</p>
                      {otherUser.currentCompany && (
                        <p className="text-xs text-gray-600">{otherUser.currentCompany}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">🤝</span>
                  <p className="text-gray-600 text-sm">No connections yet</p>
                </div>
              )}
              {connections.length > 5 && (
                <button 
                  onClick={() => navigate('/connections')}
                  className="text-blue-600 hover:underline text-sm w-full text-center mt-2"
                >
                  View all {connections.length} connections →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
