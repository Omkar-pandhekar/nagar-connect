"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#map" className="hover:text-white">
                  Live Map
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#report" className="hover:text-white">
                  Report Issue
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Email: support@nagar-connect.gov.in</li>
              <li>Phone: +91-00000-00000</li>
              <li>City: Chhatrapati Sambhajinagar</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} Nagar-Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
