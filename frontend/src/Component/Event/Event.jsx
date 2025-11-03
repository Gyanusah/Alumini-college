import React, { useState, useEffect } from "react";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: "",
    isVirtual: "",
  });
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    fetchEvents();
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
        // Track which events user is registered for
        const userRegistered = events
          .filter((event) =>
            event.attendees?.some((att) => att.user === data.data._id)
          )
          .map((event) => event._id);
        setRegisteredEvents(userRegistered);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/events";

      if (filters.eventType) url += `&eventType=${filters.eventType}`;
      if (filters.isVirtual) url += `&isVirtual=${filters.isVirtual}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Filter events to show approved ones first, then pending
        const approvedEvents = data.data.filter((e) => e.isApproved);
        const pendingEvents = data.data.filter((e) => !e.isApproved);
        setEvents([...approvedEvents, ...pendingEvents]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegisterEvent = async (eventId) => {
    if (!user) {
      alert("Please login to register for events");
      return;
    }

    if (registeredEvents.includes(eventId)) {
      alert("You are already registered for this event");
      return;
    }

    setRegistering(eventId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Successfully registered for the event!");
        setRegisteredEvents([...registeredEvents, eventId]);
        // Refresh events to update attendee count
        fetchEvents();
      } else {
        alert(data.message || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Error registering for event");
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Filter Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="eventType"
            value={filters.eventType}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Event Types</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="conference">Conference</option>
            <option value="reunion">Reunion</option>
            <option value="networking">Networking</option>
          </select>
          <select
            name="isVirtual"
            value={filters.isVirtual}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Formats</option>
            <option value="true">Virtual</option>
            <option value="false">In-Person</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No events found matching your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="card">
              <div className="mb-4">
                <div className="w-full h-40 bg-linear-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-4xl">
                  📅
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{event.title}</h3>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-gray-600">
                  <strong>📍</strong> {event.location}
                </p>
                <p className="text-gray-600">
                  <strong>🕐</strong> {formatDate(event.startDate)}
                </p>
                {event.isVirtual && (
                  <p className="text-blue-600 font-semibold">Virtual Event</p>
                )}
              </div>

              <p className="text-gray-700 line-clamp-3 mb-4">
                {event.description}
              </p>

              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold">
                  {event.eventType}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-semibold">
                  {event.attendees.length} Registered
                </span>
                {!event.isApproved && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-semibold">
                    ⏳ Pending Approval
                  </span>
                )}
              </div>

              {registeredEvents.includes(event._id) ? (
                <button className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg font-semibold cursor-not-allowed text-sm">
                  ✓ Already Registered
                </button>
              ) : (
                <button
                  onClick={() => handleRegisterEvent(event._id)}
                  className="w-full mt-4 btn-primary text-sm font-semibold"
                  disabled={registering === event._id}
                >
                  {registering === event._id
                    ? "Registering..."
                    : "Register Now"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
 