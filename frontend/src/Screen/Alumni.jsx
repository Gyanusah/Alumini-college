import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
        // Fetch sent connection requests
        const connResponse = await fetch(
          "http://localhost:5000/api/connections",
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
      let url = "http://localhost:5000/api/users?role=alumni";

      if (filters.branch) url += `&branch=${filters.branch}`;
      if (filters.company) url += `&company=${filters.company}`;
      if (filters.skills) url += `&skills=${filters.skills}`;

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
      const response = await fetch("http://localhost:5000/api/connections", {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Alumni Network</h1>
        {currentUser && currentUser.role === "student" ? (
          <p className="text-lg text-gray-600">
            🤝 Connect with experienced alumni and expand your professional
            network
          </p>
        ) : currentUser && currentUser.role === "alumni" ? (
          <p className="text-lg text-gray-600">
            👥 Browse and connect with fellow alumni from our community
          </p>
        ) : (
          <p className="text-lg text-gray-600">
            Discover our vibrant alumni community and their professional
            achievements
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Filter Alumni</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="branch"
            placeholder="Filter by branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className="border rounded-md px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            name="company"
            placeholder="Filter by company"
            value={filters.company}
            onChange={handleFilterChange}
            className="input-field border rounded-md px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            name="skills"
            placeholder="Filter by skills"
            value={filters.skills}
            onChange={handleFilterChange}
            className="border rounded-md px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Alumni Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading alumni...</p>
        </div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No alumni found matching your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <div key={person._id} className="card hover:shadow-lg transition">
              <Link to={`/profile/${person._id}`} className="cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold">{person.name}</h3>
                    <p className="text-gray-600 text-sm">{person.branch}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {person.currentCompany && (
                    <p>
                      <strong>💼 Company:</strong> {person.currentCompany}
                    </p>
                  )}
                  {person.designation && (
                    <p>
                      <strong>🎯 Designation:</strong> {person.designation}
                    </p>
                  )}
                  <p>
                    <strong>📅 Graduation:</strong> {person.graduationYear}
                  </p>
                </div>

                {person.skills && person.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {person.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {person.skills && person.skills.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          +{person.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>

              <div className="flex gap-2 mt-4">
                <Link to={`/profile/${person._id}`} className="flex-1">
                  <button className="w-full btn-primary text-sm">
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
                    className={`flex-1 text-sm font-semibold py-2 px-3 rounded transition ${
                      sentRequests.includes(person._id)
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : requestingConnection === person._id
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-purple-500 hover:bg-purple-600 text-white"
                    }`}
                  >
                    {sentRequests.includes(person._id)
                      ? "✓ Connected"
                      : requestingConnection === person._id
                      ? "⏳"
                      : "🤝 Connect"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alumni;
