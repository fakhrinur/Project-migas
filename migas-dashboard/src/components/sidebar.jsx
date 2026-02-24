// src/components/sidebar.jsx
import { Link } from 'react-router-dom';

function Sidebar({ isCollapsed }) {
  return (
    <div
      className={`bg-gradient-to-b from-yellow-500 to-orange-600 h-screen p-6 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Judul */}
      {!isCollapsed && (
        <h1 className="text-2xl font-bold text-white mb-8">Dashboard Migas</h1>
      )}

      {/* Navigasi */}
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center text-white hover:text-gray-200 py-2 px-4 rounded transition ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              📊
              {!isCollapsed && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/cp-aramco"
              className={`flex items-center text-white hover:text-gray-200 py-2 px-4 rounded transition ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              🛢️
              {!isCollapsed && <span className="ml-3">CP Aramco</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/kurs-data"
              className={`flex items-center text-white hover:text-gray-200 py-2 px-4 rounded transition ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              💱
              {!isCollapsed && <span className="ml-3">Kurs Data</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/lpg-nasional"
              className={`flex items-center text-white hover:text-gray-200 py-2 px-4 rounded transition ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              🔥
              {!isCollapsed && <span className="ml-3">LPG Nasional</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/lpg-provinsi"
              className={`flex items-center text-white hover:text-gray-200 py-2 px-4 rounded transition ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              🗺️
              {!isCollapsed && <span className="ml-3">LPG Provinsi</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => {
            localStorage.removeItem('userRole');
            window.location.href = '/login';
          }}
          className={`bg-yellow-700 text-white py-2 px-4 rounded hover:bg-yellow-800 transition ${
            isCollapsed ? 'px-2 text-sm' : ''
          }`}
        >
          {!isCollapsed ? '🔐 Logout' : '🔐'}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;