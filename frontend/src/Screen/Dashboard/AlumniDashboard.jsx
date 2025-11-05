import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

function AlumniDashboard({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    jobType: "Full-time",
    applicationDeadline: "",
  });
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    location: "",
    eventType: "workshop",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] =
    useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [processingApplication, setProcessingApplication] = useState(null);
  const [deletingConnectionId, setDeletingConnectionId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showEditJobForm, setShowEditJobForm] = useState(false);
  const [quickStats, setQuickStats] = useState({
    profileViews: 0,
    jobApplications: 0,
    eventRegistrations: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Initialize variables
      let acceptedConnections = [];
      let userJobs = [];
      let userEventsForStats = [];

      // Fetch user's jobs
      const jobResponse = await fetch(API_ENDPOINTS.JOBS);
      const jobData = await jobResponse.json();
      if (jobData.success) {
        // Filter jobs and handle null postedBy
        userJobs = jobData.data.filter((j) => j.postedBy && j.postedBy._id === user._id);
        setJobs(userJobs);
      }

      // Fetch user's events
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS);
      const eventData = await eventResponse.json();
      if (eventData.success) {
        // Show user's events sorted by approval status and handle null createdBy
        const userEvents = eventData.data.filter(
          (e) => e.createdBy && e.createdBy._id === user._id
        );
        const approvedEvents = userEvents.filter((e) => e.isApproved);
        const pendingEvents = userEvents.filter((e) => !e.isApproved);
        setEvents([...approvedEvents, ...pendingEvents]);
        userEventsForStats = userEvents;
      }

      // Fetch connections
      const connResponse = await fetch(
        API_ENDPOINTS.CONNECTIONS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const connData = await connResponse.json();
      if (connData.success) {
        // Filter connections where user is the recipient
        acceptedConnections = connData.data.filter((c) => c.status === "accepted");
        const pendingConnectionRequests = connData.data.filter(
          (c) => c.status === "pending" && c.recipient._id === user._id
        );
        const mentorshipReqs = connData.data.filter(
          (c) => c.mentorshipRequest && c.status === "pending" && c.recipient._id === user._id
        );
        
        setConnections(acceptedConnections);
        setPendingRequests(pendingConnectionRequests);
        setMentorshipRequests(mentorshipReqs);
      }

      // Calculate quick stats
      const totalApplications = userJobs.reduce((sum, job) => {
        return sum + (job.applications?.length || 0);
      }, 0);
      
      const totalRegistrations = userEventsForStats.reduce((sum, event) => sum + (event.registrations?.length || 0), 0);
      
      setQuickStats({
        profileViews: acceptedConnections.length * 3, // Estimate based on connections
        jobApplications: totalApplications,
        eventRegistrations: totalRegistrations
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = (job) => {
    setSelectedJobForApplications(job);
    setShowApplications(true);
  };

  const handleCloseApplications = () => {
    setShowApplications(false);
    setSelectedJobForApplications(null);
  };

  const handleMentorshipResponse = async (requestId, action) => {
    setProcessingRequest(requestId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.CONNECTION_ACTION(requestId, action),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert(`Mentorship request ${action}ed successfully!`);
        fetchDashboardData();
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(data.message || "Your account is pending verification. Please wait for admin approval.");
        } else {
          alert(data.message || `Failed to ${action} mentorship request`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing mentorship request:`, error);
      alert(`Error ${action}ing mentorship request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleApplicationResponse = async (applicationIndex, action) => {
    setProcessingApplication(applicationIndex);
    try {
      const token = localStorage.getItem("token");
      const application =
        selectedJobForApplications.applications[applicationIndex];

      const response = await fetch(
        `${API_ENDPOINTS.JOB_BY_ID(selectedJobForApplications._id)}/applications/${applicationIndex}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert(`Application ${action}ed successfully!`);
        fetchDashboardData();
        // Refresh the selected job to update applications
        const updatedJob = jobs.find(
          (j) => j._id === selectedJobForApplications._id
        );
        if (updatedJob) {
          setSelectedJobForApplications(updatedJob);
        }
      } else {
        alert(`Failed to ${action} application`);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      alert(`Error ${action}ing application`);
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleDeleteConnection = async (connectionId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from your connections?`)) {
      return;
    }

    setDeletingConnectionId(connectionId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.CONNECTION_BY_ID(connectionId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Connection removed successfully!");
        // Remove from local state
        setConnections(connections.filter(c => c._id !== connectionId));
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(data.message || "Your account is pending verification. Please wait for admin approval.");
        } else {
          alert(data.message || "Failed to remove connection");
        }
      }
    } catch (error) {
      console.error("Error deleting connection:", error);
      alert("Error removing connection");
    } finally {
      setDeletingConnectionId(null);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete the job posting "${jobTitle}"?\n\nThis will permanently remove the job and all its applications.`)) {
      return;
    }

    setDeletingJobId(jobId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.JOB_BY_ID(jobId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Job deleted successfully!");
        // Remove from local state
        setJobs(jobs.filter(j => j._id !== jobId));
      } else {
        const data = await response.json();
        if (response.status === 403) {
          alert(data.message || "You are not authorized to delete this job.");
        } else {
          alert(data.message || "Failed to delete job");
        }
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Error deleting job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      jobType: job.jobType,
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
    });
    setShowEditJobForm(true);
    setShowJobForm(false);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.JOB_BY_ID(editingJob._id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobFormData),
      });

      if (response.ok) {
        alert("Job updated successfully!");
        setShowEditJobForm(false);
        setEditingJob(null);
        setJobFormData({
          title: "",
          company: "",
          location: "",
          description: "",
          jobType: "Full-time",
          applicationDeadline: "",
        });
        fetchDashboardData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Error updating job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditJobForm(false);
    setEditingJob(null);
    setJobFormData({
      title: "",
      company: "",
      location: "",
      description: "",
      jobType: "Full-time",
      applicationDeadline: "",
    });
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.JOBS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs([...jobs, data.data]);
        setJobFormData({
          title: "",
          company: "",
          location: "",
          description: "",
          jobType: "Full-time",
          applicationDeadline: "",
        });
        setShowJobForm(false);
        alert("Job posted successfully!");
      } else {
        alert("Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Error posting job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Validate dates
      if (!eventFormData.startDate || !eventFormData.endDate) {
        alert("Please select both start and end dates");
        setSubmitting(false);
        return;
      }

      // Convert datetime-local to ISO format
      const startDate = new Date(eventFormData.startDate).toISOString();
      const endDate = new Date(eventFormData.endDate).toISOString();

      // Validate end date is after start date
      if (new Date(endDate) <= new Date(startDate)) {
        alert("End date must be after start date");
        setSubmitting(false);
        return;
      }

      const eventData = {
        ...eventFormData,
        startDate: startDate,
        endDate: endDate,
      };

      const response = await fetch(API_ENDPOINTS.EVENTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const data = await response.json();
        setEvents([...events, data.data]);
        setEventFormData({
          title: "",
          description: "",
          location: "",
          eventType: "workshop",
          startDate: "",
          endDate: "",
        });
        setShowEventForm(false);
        alert("Event created successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your network today</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Jobs Posted</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{jobs.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Events Created</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{events.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Connections</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{connections.length}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{pendingRequests.length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Mentorship Requests</p>
                <p className="text-3xl font-bold text-pink-600 mt-2">{mentorshipRequests.length}</p>
              </div>
              <div className="bg-pink-100 rounded-full p-3">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Connection Requests */}
          {pendingRequests.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">
                Connection Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{req.requester.name}</p>
                        <p className="text-gray-600 text-xs">
                          {req.requester.currentCompany && `${req.requester.currentCompany} • `}
                          {req.requester.designation}
                        </p>
                        {req.message && (
                          <p className="text-gray-600 text-sm mt-1">{req.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleMentorshipResponse(req._id, "accept")
                        }
                        disabled={processingRequest === req._id}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {processingRequest === req._id
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() =>
                          handleMentorshipResponse(req._id, "reject")
                        }
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

          {/* Mentorship Requests */}
          {mentorshipRequests.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">
                Mentorship Requests ({mentorshipRequests.length})
              </h2>
              <div className="space-y-4">
                {mentorshipRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border-l-4 border-purple-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{req.requester.name}</p>
                        <p className="text-gray-600 text-xs">
                          {req.requester.currentCompany && `${req.requester.currentCompany} • `}
                          {req.requester.designation}
                        </p>
                        {req.message && (
                          <p className="text-gray-600 text-sm mt-1">{req.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleMentorshipResponse(req._id, "accept")
                        }
                        disabled={processingRequest === req._id}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {processingRequest === req._id
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() =>
                          handleMentorshipResponse(req._id, "reject")
                        }
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

          {/* My Jobs */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Job Postings
                </h2>
                <p className="text-gray-600 text-sm mt-1">Manage your job opportunities</p>
              </div>
              <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-xl">+</span> Post New Job
              </button>
            </div>

            {showJobForm && (
              <form
                onSubmit={handleJobSubmit}
                className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💼 Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={jobFormData.title}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏢 Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Google, Microsoft"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={jobFormData.company}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, company: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., San Francisco, Remote"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={jobFormData.location}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Job Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      value={jobFormData.jobType}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, jobType: e.target.value })
                      }
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Job Description
                  </label>
                  <textarea
                    placeholder="Describe the role, responsibilities, requirements, and benefits..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="5"
                    value={jobFormData.description}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Application Deadline
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={jobFormData.applicationDeadline}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        applicationDeadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "⏳ Posting..." : "✓ Post Job"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Edit Job Form */}
            {showEditJobForm && editingJob && (
              <form
                onSubmit={handleUpdateJob}
                className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✏️</span>
                  <h3 className="text-xl font-bold text-gray-800">Edit Job Posting</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💼 Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      value={jobFormData.title}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏢 Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Google, Microsoft"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      value={jobFormData.company}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, company: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., San Francisco, Remote"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      value={jobFormData.location}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Job Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                      value={jobFormData.jobType}
                      onChange={(e) =>
                        setJobFormData({ ...jobFormData, jobType: e.target.value })
                      }
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                    </select>
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Job Description
                  </label>
                  <textarea
                    placeholder="Describe the role, responsibilities, requirements, and benefits..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    rows="5"
                    value={jobFormData.description}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Application Deadline
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    value={jobFormData.applicationDeadline}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        applicationDeadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "⏳ Updating..." : "✓ Update Job"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {jobs.map((job) => {
                // Safe date parsing with fallback
                const parseDate = (dateString) => {
                  if (!dateString) return null;
                  const date = new Date(dateString);
                  return isNaN(date.getTime()) ? null : date;
                };
                
                const postedDate = parseDate(job.createdAt);
                const endDate = parseDate(job.applicationDeadline);
                const isExpired = endDate ? endDate < new Date() : false;
                const daysRemaining = endDate ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <div 
                    key={job._id} 
                    className={`border rounded-lg p-4 shadow-md ${isExpired ? 'bg-gray-50 border-gray-300' : 'border-blue-200 bg-blue-50'}`}
                  >
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          {isExpired ? (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              ⏰ Expired
                            </span>
                          ) : daysRemaining <= 3 && daysRemaining > 0 ? (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                              ⚠️ {daysRemaining} days left
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              ✓ Active
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm">
                          🏢 {job.company} • 📍 {job.location} • 💼 {job.jobType}
                        </p>
                        
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {job.description}
                        </p>
                        
                        {/* Posted By and Dates */}
                        <div className="mt-3 bg-white rounded p-2 border border-gray-200">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 font-semibold">Posted By:</p>
                              <p className="text-gray-800">👤 {user.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold">Posted Date:</p>
                              <p className="text-gray-800">📅 {postedDate ? postedDate.toLocaleDateString() : 'N/A'}</p>
                              {postedDate && <p className="text-gray-500 text-xs">{postedDate.toLocaleTimeString()}</p>}
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold">End Date:</p>
                              <p className="text-gray-800">🏁 {endDate ? endDate.toLocaleDateString() : 'N/A'}</p>
                              {endDate && <p className="text-gray-500 text-xs">{endDate.toLocaleTimeString()}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center justify-between border-t pt-3">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
                          📊 {job.applications?.length || 0} Applications
                        </span>
                        {job.applications && job.applications.length > 0 && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                            ✓ {job.applications.filter(app => app.status === 'accepted').length} Accepted
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {job.applications && job.applications.length > 0 && (
                          <button
                            onClick={() => handleViewApplications(job)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            👁️ View Applications
                          </button>
                        )}
                        <button
                          onClick={() => handleEditJob(job)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                          title="Edit job"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          disabled={deletingJobId === job._id}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                          title="Delete job"
                        >
                          {deletingJobId === job._id ? "⏳" : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {jobs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg mb-2">📋 No jobs posted yet</p>
                  <p className="text-gray-500 text-sm">Click "+ Post Job" to create your first job posting</p>
                </div>
              )}
            </div>
          </div>

          {/* My Events */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Events
                </h2>
                <p className="text-gray-600 text-sm mt-1">Organize and manage your events</p>
              </div>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-xl">+</span> Create Event
              </button>
            </div>

            {showEventForm && (
              <form
                onSubmit={handleEventSubmit}
                className="mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎉 Event Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Annual Alumni Meetup 2025"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={eventFormData.title}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Conference Hall, Virtual"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={eventFormData.location}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎯 Event Type
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                      value={eventFormData.eventType}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          eventType: e.target.value,
                        })
                      }
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="conference">Conference</option>
                      <option value="reunion">Reunion</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={eventFormData.startDate}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏁 End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      value={eventFormData.endDate}
                      onChange={(e) =>
                        setEventFormData({
                          ...eventFormData,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Event Description
                  </label>
                  <textarea
                    placeholder="Describe the event, agenda, speakers, and what attendees can expect..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    rows="5"
                    value={eventFormData.description}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "⏳ Creating..." : "✓ Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.location}</p>
                      <p className="text-sm mt-2">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {!event.isApproved && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                        ⏳ Pending
                      </span>
                    )}
                    {event.isApproved && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-600">No events created yet</p>
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
                <p className="text-xs text-gray-500 font-semibold mb-1">🏢 Company</p>
                <p className="text-sm font-semibold text-gray-800">{user.currentCompany || "Not set"}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">💼 Designation</p>
                <p className="text-sm font-semibold text-gray-800">{user.designation || "Not set"}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">🎓 Branch</p>
                <p className="text-sm font-semibold text-gray-800">{user.branch}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-medium text-gray-700">👁️ Profile Views</span>
                <span className="text-lg font-bold text-blue-600">{quickStats.profileViews}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                <span className="text-sm font-medium text-gray-700">📊 Job Applications</span>
                <span className="text-lg font-bold text-green-600">{quickStats.jobApplications}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-sm font-medium text-gray-700">🎫 Event Registrations</span>
                <span className="text-lg font-bold text-purple-600">{quickStats.eventRegistrations}</span>
              </div>
            </div>
          </div>

          {/* Recent Connections */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recent Connections ({connections.length})
            </h3>
            <div className="space-y-3">
              {connections.length > 0 ? (
                connections.slice(0, 5).map((conn) => {
                  const otherUser = conn.requester._id === user._id ? conn.recipient : conn.requester;
                  return (
                    <div key={conn._id} className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-r-xl pl-4 pr-3 py-3 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{otherUser.name}</p>
                        <p className="text-xs text-gray-600">
                          {otherUser.currentCompany && `${otherUser.currentCompany} • `}
                          {otherUser.designation}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteConnection(conn._id, otherUser.name)}
                        disabled={deletingConnectionId === conn._id}
                        className="text-red-600 hover:text-red-800 text-lg disabled:opacity-50 ml-2"
                        title="Remove connection"
                      >
                        {deletingConnectionId === conn._id ? "⏳" : "✕"}
                      </button>
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

      {/* Applications Modal */}
      {showApplications && selectedJobForApplications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Applications for {selectedJobForApplications.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedJobForApplications.applications?.length || 0}{" "}
                  applications
                </p>
              </div>
              <button
                onClick={handleCloseApplications}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedJobForApplications.applications &&
              selectedJobForApplications.applications.length > 0 ? (
                selectedJobForApplications.applications.map(
                  (application, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">
                            {application.user?.name || "Anonymous"}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {application.user?.email || "No email"}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold">
                          Applied
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {application.user?.currentCompany && (
                          <p className="text-sm">
                            <strong>Company:</strong>{" "}
                            {application.user.currentCompany}
                          </p>
                        )}
                        {application.user?.designation && (
                          <p className="text-sm">
                            <strong>Designation:</strong>{" "}
                            {application.user.designation}
                          </p>
                        )}
                        {application.user?.branch && (
                          <p className="text-sm">
                            <strong>Branch:</strong> {application.user.branch}
                          </p>
                        )}
                      </div>

                      {application.resume && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold mb-1">Resume:</p>
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            📄 View Resume
                          </a>
                        </div>
                      )}

                      {application.coverLetter && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold mb-1">
                            Cover Letter:
                          </p>
                          <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() =>
                            handleApplicationResponse(idx, "accept")
                          }
                          disabled={processingApplication === idx}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
                        >
                          {processingApplication === idx ? "⏳" : "✓"} Accept
                        </button>
                        <button
                          onClick={() =>
                            handleApplicationResponse(idx, "reject")
                          }
                          disabled={processingApplication === idx}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
                        >
                          {processingApplication === idx ? "⏳" : "✕"} Reject
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/profile/${application.user?._id}`)
                          }
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-semibold"
                        >
                          👤 View Profile
                        </button>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No applications yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AlumniDashboard;
