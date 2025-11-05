import React, { useState, useEffect } from "react";

function AdminDashboard({ user }) {
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

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all users
      const userResponse = await fetch("http://localhost:5000/api/users/user");
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
      const jobResponse = await fetch("http://localhost:5000/api/jobs");
      const jobData = await jobResponse.json();
      if (jobData.success) {
        setStats((prev) => ({
          ...prev,
          totalJobs: jobData.data.length,
        }));
      }

      // Fetch events
      const eventResponse = await fetch("http://localhost:5000/api/events");
      const eventData = await eventResponse.json();
      if (eventData.success) {
        setStats((prev) => ({
          ...prev,
          totalEvents: eventData.data.length,
        }));
        setPendingEvents(eventData.data.filter((e) => !e.isApproved));
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
        `http://localhost:5000/api/events/${eventId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
      }
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalUsers}
          </div>
          <p className="text-gray-600">Total Users</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.totalAlumni}
          </div>
          <p className="text-gray-600">Alumni</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalStudents}
          </div>
          <p className="text-gray-600">Students</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">
            {stats.totalJobs}
          </div>
          <p className="text-gray-600">Job Postings</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">
            {stats.totalEvents}
          </div>
          <p className="text-gray-600">Events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 font-semibold ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-4 font-semibold ${
              activeTab === "users"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-2 px-4 font-semibold ${
              activeTab === "events"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
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
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold">New User Registration</p>
                <p className="text-gray-600 text-sm">
                  5 new users registered today
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold">Job Postings</p>
                <p className="text-gray-600 text-sm">
                  3 new job postings created
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold">Events Created</p>
                <p className="text-gray-600 text-sm">
                  2 new events pending approval
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full btn-primary">Post Announcement</button>
              <button className="w-full btn-secondary">View Reports</button>
              <button className="w-full btn-secondary">Manage Users</button>
              <button className="w-full btn-secondary">View Analytics</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{u.name}</td>
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : u.role === "alumni"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">{u.branch}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {u.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button className="text-blue-600 hover:underline text-sm">
                        View
                      </button>
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
    </div>
  );
}

export default AdminDashboard;
