import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobType: "",
    company: "",
    location: "",
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    resume: "",
    coverLetter: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchUserData();
  }, [filters]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        // Track which jobs user has already applied to
        const userAppliedJobs = jobs
          .filter((job) =>
            job.applications?.some((app) => app.user === data.data._id)
          )
          .map((job) => job._id);
        setAppliedJobs(userAppliedJobs);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/jobs?isActive=true";
      // let url = "http://localhost:5000/api/jobs";

      if (filters.jobType) url += `&jobType=${filters.jobType}`;
      if (filters.company) url += `&company=${filters.company}`;
      if (filters.location) url += `&location=${filters.location}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to apply for jobs");
      return;
    }

    if (user.role !== "student") {
      alert("Only students can apply for jobs");
      return;
    }

    if (!applicationData.resume.trim()) {
      alert("Please enter your resume URL");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/jobs/${selectedJob._id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(applicationData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Application submitted successfully!");
        setAppliedJobs([...appliedJobs, selectedJob._id]);
        setApplicationData({ resume: "", coverLetter: "" });
        setShowApplicationForm(false);

        // Show success message and navigate to alumni profile
        setTimeout(() => {
          alert(
            `Great! You've applied for this job. Let's connect with ${selectedJob.postedBy.name}!`
          );
          // Navigate to alumni profile page
          navigate(`/profile/${selectedJob.postedBy._id}`);
        }, 500);
      } else {
        alert(data.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Job Opportunities
          </h1>
          <p className="text-gray-600">Find your dream job from our alumni network</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-gray-800">Filter Jobs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">💼</span>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">🏢</span>
              <input
                type="text"
                name="company"
                placeholder="Filter by company"
                value={filters.company}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">📍</span>
              <input
                type="text"
                name="location"
                placeholder="Filter by location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-xl text-gray-600 font-semibold">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <span className="text-6xl mb-4 block">💼</span>
                <p className="text-2xl font-bold text-gray-800 mb-2">No Jobs Found</p>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                      selectedJob?._id === job._id
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'
                    }`}
                  >
                    {/* Card Header with Gradient */}
                    <div className={`h-2 ${
                      selectedJob?._id === job._id
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-blue-400 to-purple-400'
                    }`}></div>
                    
                    <div className="p-6">
                      {/* Title and Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">🏢</span>
                            <p className="font-semibold text-lg">{job.company}</p>
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                          {job.jobType}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-blue-500 text-lg">📍</span>
                        <p className="text-gray-700 font-medium">{job.location}</p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      {/* Footer with Posted By */}
                      {job.postedBy && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {job.postedBy.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Posted by</p>
                              <p className="text-sm font-bold text-gray-800">{job.postedBy.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Click to view details</p>
                            <p className="text-sm font-semibold text-blue-600">→</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">{selectedJob.title}</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-600">Company</p>
                  <p className="text-lg">{selectedJob.company}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Location</p>
                  <p className="text-lg">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Job Type</p>
                  <p className="text-lg">{selectedJob.jobType}</p>
                </div>
                {selectedJob.salary?.isDisclosed && (
                  <div>
                    <p className="font-semibold text-gray-600">Salary</p>
                    <p className="text-lg">
                      {selectedJob.salary.currency} {selectedJob.salary.min} -{" "}
                      {selectedJob.salary.max}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-600">Description</p>
                  <p className="text-gray-700">{selectedJob.description}</p>
                </div>
                {selectedJob.requirements && (
                  <div>
                    <p className="font-semibold text-gray-600">Requirements</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-700">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-4 border-t">
                  {appliedJobs.includes(selectedJob._id) ? (
                    <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold cursor-not-allowed shadow-lg">
                      ✓ Already Applied
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setShowApplicationForm(!showApplicationForm)
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {showApplicationForm ? "✕ Cancel" : "📝 Apply Now"}
                    </button>
                  )}
                </div>

                {/* Application Form */}
                {showApplicationForm &&
                  !appliedJobs.includes(selectedJob._id) && (
                    <form
                      onSubmit={handleApplyJob}
                      className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📝</span>
                        <h3 className="text-xl font-bold text-gray-800">
                          Submit Your Application
                        </h3>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📎 Resume URL *
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/resume.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          value={applicationData.resume}
                          onChange={(e) =>
                            setApplicationData({
                              ...applicationData,
                              resume: e.target.value,
                            })
                          }
                          required
                        />
                        <p className="text-xs text-gray-600 mt-2 italic">
                          💡 Provide a link to your resume (PDF, Google Drive, LinkedIn, etc.)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ✍️ Cover Letter
                        </label>
                        <textarea
                          placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          rows="5"
                          value={applicationData.coverLetter}
                          onChange={(e) =>
                            setApplicationData({
                              ...applicationData,
                              coverLetter: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                          disabled={submitting}
                        >
                          {submitting ? "⏳ Submitting..." : "✓ Submit Application"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplicationForm(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </form>
                  )}
              </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <span className="text-6xl mb-4 block">👈</span>
                <p className="text-gray-600 font-semibold">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
