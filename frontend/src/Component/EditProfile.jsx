import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    branch: "",
    graduationYear: "",
    currentCompany: "",
    designation: "",
    skills: "",
    linkedin: "",
    github: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        branch: user.branch || "",
        graduationYear: user.graduationYear || "",
        currentCompany: user.currentCompany || "",
        designation: user.designation || "",
        skills: user.skills ? user.skills.join(", ") : "",
        linkedin: user.linkedin || "",
        github: user.github || "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to update profile");
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        setError("Name is required");
        setSubmitting(false);
        return;
      }

      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const updateData = {
        name: formData.name,
        bio: formData.bio,
        branch: formData.branch,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        currentCompany: formData.currentCompany,
        designation: formData.designation,
        skills: skillsArray,
        linkedin: formData.linkedin,
        github: formData.github,
      };

      const response = await fetch(
        "http://localhost:5000/api/auth/updatedetails",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.data);
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
        <p className="text-gray-600 mb-8">Update your profile information</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 border-red">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field  border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Branch/Department
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className="input-field border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Graduation Year */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  className="input-field border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1990"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="input-field  text-center border border-gray-300 rounded-md 
                px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1 ">
                Maximum 500 characters
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold mb-4">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Company */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Current Company
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="e.g., Google, Microsoft"
                  className="input-field border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Designation/Job Title
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., Senior Developer"
                  className="input-field border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">Skills</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                className="input-field  border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple skills with commas
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold mb-4">Social Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="input-field border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourprofile"
                  className="input-field  border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="btn-primary py-3 px-6 font-semibold
              bg-blue-500 text-white  rounded"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className=" py-3 px-6 font-semibold bg-blue-500 text-white  rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
