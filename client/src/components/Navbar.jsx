import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { logout as apiLogout } from '../api/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiLogout();
    } catch (e) {}
    logout();
    navigate('/login');
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 h-14 flex items-center justify-between px-4 sm:px-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-gray-900 font-semibold text-lg hover:text-blue-600 cursor-pointer transition-colors"
      >
        WorkflowApp
      </button>
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <span className="text-gray-500 text-sm hidden sm:inline">{user.email}</span>
        )}
        <button
          onClick={handleLogout}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm cursor-pointer transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
