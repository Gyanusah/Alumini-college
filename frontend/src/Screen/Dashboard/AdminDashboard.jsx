import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAlumni: 0,
    totalStudents: 0,
    totalJobs: 0,
    totalEvents: 0,
  });
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [processingUserId, setProcessingUserId] = useState(null);
  const [recentActivity, setRecentActivity] = useState({
    newUsersToday: 0,
    newJobsToday: 0,
    pendingEvents: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all users
      const userResponse = await fetch(API_ENDPOINTS.ALL_USERS);
      const userData = await userResponse.json();
      if (userData.success) {
        setUsers(userData.data);
        const alumni = userData.data.filter((u) => u.role === "alumni").length;
        const students = userData.data.filter(
          (u) => u.role === "student"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalUsers: userData.data.length,
          totalAlumni: alumni,
          totalStudents: students,
        }));
      }

      // Fetch jobs
      const jobResponse = await fetch(API_ENDPOINTS.JOBS);
      const jobData = await jobResponse.json();
      if (jobData.success) {
        setStats((prev) => ({
          ...prev,
          totalJobs: jobData.data.length,
        }));
      }

      // Fetch events
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS);
      const eventData = await eventResponse.json();
      if (eventData.success) {
        setStats((prev) => ({
          ...prev,
          totalEvents: eventData.data.length,
        }));
        setPendingEvents(eventData.data.filter((e) => !e.isApproved));
      }

      // Fetch recent activity
      const activityResponse = await fetch(API_ENDPOINTS.RECENT_ACTIVITY, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activityData = await activityResponse.json();
      if (activityData.success) {
        setRecentActivity(activityData.data.stats);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.APPROVE_EVENT(eventId),
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
        alert("Event approved successfully!");
      }
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event");
    }
  };

  const handleVerifyUser = async (userId) => {
    setProcessingUserId(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.VERIFY_USER(userId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("User verified successfully!");
        // Update user in the list
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isVerified: true } : u
        ));
      } else {
        alert(data.message || "Failed to verify user");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      alert("Error verifying user");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleUnverifyUser = async (userId) => {
    setProcessingUserId(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.UNVERIFY_USER(userId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("User unverified successfully!");
        // Update user in the list
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isVerified: false } : u
        ));
      } else {
        alert("Failed to unverify user");
      }
    } catch (error) {
      console.error("Error unverifying user:", error);
      alert("Error unverifying user");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeletingUserId(selectedUser._id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.USER_BY_ID(selectedUser._id),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("User deleted successfully!");
        setUsers(users.filter(u => u._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage users, events, and platform activities</p>
          </div>
          <button
            onClick={() => navigate("/create-admin")}
            className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">👤</span>
              Create Admin
            </span>
            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">👥</span>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{stats.totalUsers}</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Total Users</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">🎓</span>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{stats.totalAlumni}</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Alumni</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">📚</span>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{stats.totalStudents}</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Students</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">💼</span>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{stats.totalJobs}</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Job Postings</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">📅</span>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{stats.totalEvents}</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Events</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "users"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "events"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Pending Events
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 card">
            <h2 className="text-2xl font-bold mb-4">Recent Activity (Live)</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <p className="font-semibold text-blue-800">New User Registration</p>
                <p className="text-blue-600 text-sm">
                  {recentActivity.newUsersToday} new user{recentActivity.newUsersToday !== 1 ? 's' : ''} registered today
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <p className="font-semibold text-green-800">Job Postings</p>
                <p className="text-green-600 text-sm">
                  {recentActivity.newJobsToday} new job posting{recentActivity.newJobsToday !== 1 ? 's' : ''} created today
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                <p className="font-semibold text-purple-800">Events Pending Approval</p>
                <p className="text-purple-600 text-sm">
                  {recentActivity.pendingEvents} event{recentActivity.pendingEvents !== 1 ? 's' : ''} pending approval
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/create-admin')}
                className="w-full btn-primary"
              >
                👤 Create Admin
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className="w-full btn-secondary"
              >
                👥 Manage Users
              </button>
              <button 
                onClick={() => setActiveTab('events')}
                className="w-full btn-secondary"
              >
                📅 Pending Events
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full btn-secondary"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            All Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          u.role === "admin"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                            : u.role === "alumni"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{u.branch}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          u.isVerified
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                        }`}
                      >
                        {u.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!u.isVerified ? (
                          <button
                            onClick={() => handleVerifyUser(u._id)}
                            disabled={processingUserId === u._id}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                          >
                            {processingUserId === u._id ? "⏳" : "Verify"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnverifyUser(u._id)}
                            disabled={processingUserId === u._id}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                          >
                            {processingUserId === u._id ? "⏳" : "Unverify"}
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewUser(u)}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(u)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={u.role === 'admin'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Pending Event Approvals</h2>
          {pendingEvents.length === 0 ? (
            <p className="text-gray-600">No pending events</p>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div key={event._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                      Pending
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{event.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveEvent(event._id)}
                      className="btn-primary text-sm"
                    >
                      Approve
                    </button>
                    <button className="btn-secondary text-sm">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Name</p>
                  <p className="text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Email</p>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Role</p>
                  <p className="text-lg capitalize">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        selectedUser.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : selectedUser.role === "alumni"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Status</p>
                  <p className="text-lg">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        selectedUser.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedUser.isVerified ? "Verified" : "Pending"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Branch</p>
                  <p className="text-lg">{selectedUser.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Graduation Year</p>
                  <p className="text-lg">{selectedUser.graduationYear}</p>
                </div>
                {selectedUser.currentCompany && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Company</p>
                    <p className="text-lg">{selectedUser.currentCompany}</p>
                  </div>
                )}
                {selectedUser.designation && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Designation</p>
                    <p className="text-lg">{selectedUser.designation}</p>
                  </div>
                )}
              </div>
              {selectedUser.bio && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Bio</p>
                  <p className="text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Delete User</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Deleting this user will remove all their data including:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                  <li>Profile information</li>
                  <li>Connections</li>
                  <li>Job applications</li>
                  <li>Event registrations</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 btn-secondary"
                  disabled={deletingUserId}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletingUserId}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingUserId ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminDashboard;
