import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function AlumniDashboard({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [connections, setConnections] = useState([]);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user's jobs
      const jobResponse = await fetch("http://localhost:5000/api/jobs");
      const jobData = await jobResponse.json();
      if (jobData.success) {
        setJobs(jobData.data.filter((j) => j.postedBy._id === user._id));
      }

      // Fetch user's events
      const eventResponse = await fetch("http://localhost:5000/api/events");
      const eventData = await eventResponse.json();
      if (eventData.success) {
        // Show user's events sorted by approval status
        const userEvents = eventData.data.filter(
          (e) => e.createdBy._id === user._id
        );
        const approvedEvents = userEvents.filter((e) => e.isApproved);
        const pendingEvents = userEvents.filter((e) => !e.isApproved);
        setEvents([...approvedEvents, ...pendingEvents]);
      }

      // Fetch connections
      const connResponse = await fetch(
        "http://localhost:5000/api/connections",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const connData = await connResponse.json();
      if (connData.success) {
        setConnections(connData.data);
        setMentorshipRequests(
          connData.data.filter(
            (c) => c.mentorshipRequest && c.status === "pending"
          )
        );
      }
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
        `http://localhost:5000/api/connections/${requestId}/${action}`,
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
        alert(`Failed to ${action} mentorship request`);
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
        `http://localhost:5000/api/jobs/${selectedJobForApplications._id}/applications/${applicationIndex}/${action}`,
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

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/jobs", {
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

      const response = await fetch("http://localhost:5000/api/events", {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Welcome, {user.name}! 👋</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6  mb-12 shadow-2xl rounded-2xl bg-gray-200 ">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
          <p className="text-gray-600">Jobs Posted</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">
            {events.length}
          </div>
          <p className="text-gray-600">Events Created</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">
            {mentorshipRequests.length}
          </div>
          <p className="text-gray-600">Mentorship Requests</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">
            {connections.length}
          </div>
          <p className="text-gray-600">Connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mentorship Requests */}
          {mentorshipRequests.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Mentorship Requests</h2>
              <div className="space-y-4">
                {mentorshipRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border-l-4 border-purple-500 pl-4 py-2"
                  >
                    <p className="font-semibold">{req.requester.name}</p>
                    <p className="text-gray-600 text-sm">{req.message}</p>
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
                          handleMentorshipResponse(req._id, "decline")
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
          <div className="card bg-gray-100 p-2 rounded shadow-xl ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Job Postings</h2>
              <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="btn-primary text-sm hover:text-blue-500 "
              >
                + Post Job
              </button>
            </div>

            {showJobForm && (
              <form
                onSubmit={handleJobSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
              >
                <input
                  type="text"
                  placeholder="Job Title"
                  className="input-field"
                  value={jobFormData.title}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, title: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Company"
                  className="input-field"
                  value={jobFormData.company}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, company: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="input-field"
                  value={jobFormData.location}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, location: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Job Description"
                  className="input-field"
                  rows="4"
                  value={jobFormData.description}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      description: e.target.value,
                    })
                  }
                  required
                ></textarea>
                <select
                  className="input-field"
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
                <input
                  type="date"
                  placeholder="Application Deadline"
                  className="input-field"
                  value={jobFormData.applicationDeadline}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      applicationDeadline: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Posting..." : "Post Job"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold">{job.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {job.company} • {job.location}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {job.applications?.length || 0} Applications
                      </span>
                      {job.applications && job.applications.length > 0 && (
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          👁️ View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-gray-600">No jobs posted yet</p>
              )}
            </div>
          </div>

          {/* My Events */}
          <div className="card bg-gray-100 p-2 rounded shadow-xl">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-2xl font-bold">My Events</h2>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="btn-primary text-sm  hover:text-blue-500"
              >
                + Create Event
              </button>
            </div>

            {showEventForm && (
              <form
                onSubmit={handleEventSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
              >
                <input
                  type="text"
                  placeholder="Event Title"
                  className="input-field"
                  value={eventFormData.title}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      title: e.target.value,
                    })
                  }
                  required
                />
                <textarea
                  placeholder="Event Description"
                  className="input-field"
                  rows="4"
                  value={eventFormData.description}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      description: e.target.value,
                    })
                  }
                  required
                ></textarea>
                <input
                  type="text"
                  placeholder="Location"
                  className="input-field"
                  value={eventFormData.location}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      location: e.target.value,
                    })
                  }
                  required
                />
                <select
                  className="input-field"
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
                <input
                  type="datetime-local"
                  placeholder="Start Date"
                  className="input-field"
                  value={eventFormData.startDate}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="datetime-local"
                  placeholder="End Date"
                  className="input-field"
                  value={eventFormData.endDate}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
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
          <div className="card bg-gray-100 p-2 rounded shadow-xl">
            <h3 className="text-xl font-bold mb-4">My Profile</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Company:</strong> {user.currentCompany || "Not set"}
              </p>
              <p>
                <strong>Designation:</strong> {user.designation || "Not set"}
              </p>
              <p>
                <strong>Branch:</strong> {user.branch}
              </p>
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full btn-primary mt-4"
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card bg-gray-100 p-2 rounded shadow-xl">
            <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Profile Views</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Job Applications</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Event Registrations</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </div>

          {/* Recent Connections */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Recent Connections</h3>
            <div className="space-y-2">
              {connections.slice(0, 5).map((conn) => (
                <div key={conn._id} className="text-sm">
                  <p className="font-semibold">
                    {conn.requester._id === user._id
                      ? conn.recipient.name
                      : conn.requester.name}
                  </p>
                </div>
              ))}
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
  );
}

export default AlumniDashboard;
