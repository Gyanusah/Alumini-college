import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

function Alumni({ user }) {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: "",
    company: "",
    skills: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [requestingConnection, setRequestingConnection] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    fetchCurrentUser();
    fetchAlumni();
  }, [filters]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.GET_ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
        // Fetch sent connection requests
        const connResponse = await fetch(
          API_ENDPOINTS.CONNECTIONS,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const connData = await connResponse.json();
        if (connData.success) {
          const sent = connData.data
            .filter((c) => c.requester._id === data.data._id)
            .map((c) => c.recipient._id);
          setSentRequests(sent);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const baseUrl = API_ENDPOINTS.ALUMNI;
      const params = new URLSearchParams();
      if (filters.branch) params.set("branch", filters.branch);
      if (filters.company) params.set("company", filters.company);
      if (filters.skills) params.set("skills", filters.skills);

      const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAlumni(data.data);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
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

  const handleSendConnectionRequest = async (alumniId) => {
    if (!currentUser) {
      alert("Please login to send connection requests");
      navigate("/login");
      return;
    }

    if (currentUser.role === "alumni") {
      alert("Alumni can only view other alumni profiles");
      return;
    }

    setRequestingConnection(alumniId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CONNECTIONS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: alumniId,
          message: `Hi! I would like to connect with you.`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Connection request sent successfully!");
        setSentRequests([...sentRequests, alumniId]);
      } else {
        alert(data.message || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Error sending connection request");
    } finally {
      setRequestingConnection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Our Alumni Network
          </h1>
          {currentUser && currentUser.role === "student" ? (
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              Connect with experienced alumni and expand your professional network
            </p>
          ) : currentUser && currentUser.role === "alumni" ? (
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Browse and connect with fellow alumni from our community
            </p>
          ) : (
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Discover our vibrant alumni community and their professional achievements
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔍</span>
            <h2 className="text-2xl font-bold text-gray-800">Find Alumni</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">🎓</span>
              <input
                type="text"
                name="branch"
                placeholder="Filter by branch (e.g., CSE, ECE)"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">🏢</span>
              <input
                type="text"
                name="company"
                placeholder="Filter by company (e.g., Google)"
                value={filters.company}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">💻</span>
              <input
                type="text"
                name="skills"
                placeholder="Filter by skills (e.g., React, Python)"
                value={filters.skills}
                onChange={handleFilterChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          {(filters.branch || filters.company || filters.skills) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <button
                onClick={() => setFilters({ branch: "", company: "", skills: "" })}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-600 font-semibold">Loading amazing alumni...</p>
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-2xl font-bold text-gray-800 mb-2">No Alumni Found</p>
            <p className="text-gray-600">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-bold text-2xl text-blue-600">{alumni.length}</span> alumni found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {alumni.map((person) => (
                <div 
                  key={person._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <Link to={`/profile/${person._id}`} className="block">
                    {/* Card Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Class of {person.graduationYear}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-8">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                          👤
                        </div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold">{person.name}</h3>
                          <p className="text-blue-100 text-sm flex items-center gap-1">
                            <span>🎓</span> {person.branch}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        {person.currentCompany && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">🏢</span>
                            <span className="text-gray-600">at</span>
                            <span className="font-semibold text-gray-800">{person.currentCompany}</span>
                          </div>
                        )}
                        {person.designation && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">💼</span>
                            <span className="font-semibold text-gray-800">{person.designation}</span>
                          </div>
                        )}
                      </div>

                      {person.skills && person.skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Top Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {person.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {person.skills.length > 4 && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                                +{person.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 flex gap-3">
                    <Link to={`/profile/${person._id}`} className="flex-1">
                      <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                        👁️ View Profile
                      </button>
                    </Link>
                    {currentUser && currentUser.role === "student" && (
                      <button
                        onClick={() => handleSendConnectionRequest(person._id)}
                        disabled={
                          requestingConnection === person._id ||
                          sentRequests.includes(person._id)
                        }
                        className={`flex-1 font-semibold py-3 rounded-xl transition-all duration-300 shadow-md ${
                          sentRequests.includes(person._id)
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed"
                            : requestingConnection === person._id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-lg"
                        }`}
                      >
                        {sentRequests.includes(person._id)
                          ? "✓ Connected"
                          : requestingConnection === person._id
                          ? "⏳ Sending..."
                          : "🤝 Connect"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Alumni;
