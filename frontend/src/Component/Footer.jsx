import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <p className="text-gray-400">
              Connecting students, alumni, and the college community through
              mentorship, networking, and opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to ="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/alumni" className="hover:text-white transition">
                  Alumni
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition">
                  Jobs
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: ggi</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: College Campus</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-400 hover:text-white transition">
                Facebook
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition">
                Twitter
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 College Alumni Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
