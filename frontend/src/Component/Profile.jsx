import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current logged-in user
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCurrentUser(data.data);
          }
        })
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${id}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      } else {
        setError("User not found");
      }
    } catch (err) {
      setError("Error loading profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 h-32"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16 mb-6">
            <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center text-6xl border-4 border-white">
              👤
            </div>
            <div className="mt-4 md:mt-0">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.branch}</p>
              <p className="text-gray-600">Graduated: {user.graduationYear}</p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full font-semibold text-white ${
                user.role === "alumni"
                  ? "bg-green-500"
                  : user.role === "admin"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">About</h2>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {/* Professional Info */}
          {(user.currentCompany || user.designation) && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.currentCompany && (
                  <div>
                    <p className="text-gray-600 font-semibold">
                      Current Company
                    </p>
                    <p className="text-lg">{user.currentCompany}</p>
                  </div>
                )}
                {user.designation && (
                  <div>
                    <p className="text-gray-600 font-semibold">Designation</p>
                    <p className="text-lg">{user.designation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Social */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Contact & Social</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> {user.email}
              </p>
              {user.linkedin && (
                <p className="text-gray-700">
                  <strong>LinkedIn:</strong>{" "}
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.linkedin}
                  </a>
                </p>
              )}
              {user.github && (
                <p className="text-gray-700">
                  <strong>GitHub:</strong>{" "}
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.github}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            {currentUser && currentUser._id === user._id ? (
              <>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="btn-primary"
                >
                  ✏️ Edit Profile
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary">Send Connection Request</button>
                {user.role === "alumni" && (
                  <button className="btn-secondary">Request Mentorship</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
