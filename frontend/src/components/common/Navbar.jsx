import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Coins, 
  User, 
  History, 
  Share2, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  PlusCircle, 
  ChevronDown 
} from 'lucide-react';

export function Navbar({ onNavigate, currentPage }) {
  const { 
    user, 
    isLoggedIn, 
    displayName, 
    userInitial, 
    credits, 
    openSignIn, 
    openBuyCreditsModal, 
    signOut 
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page, tab) => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate(page, tab);
  };

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 focus:outline-none group text-left"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-card flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary-700 transition">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <span className="font-bold text-base text-gray-900 tracking-tight">Prepo<span className="text-primary-600">.ai</span></span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200">
              AI Mock Tests
            </span>
          </div>
        </button>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('config')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-card transition flex items-center gap-1.5 ${
              currentPage === 'config' 
                ? 'bg-primary-50 text-primary-700 font-semibold' 
                : 'text-gray-700 hover:text-primary-600 hover:bg-surface-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            Create Test
          </button>

          {isLoggedIn ? (
            <>
              {/* Credits Badge */}
              <button
                onClick={openBuyCreditsModal}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-full text-xs font-semibold text-amber-800 transition"
                title="Click to buy more credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{credits} Credits</span>
                <PlusCircle className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-card hover:bg-surface-100 border border-transparent hover:border-surface-200 transition focus:outline-none"
                >
                  <div className="w-7 h-7 bg-primary-600 text-white rounded-card flex items-center justify-center text-xs font-bold shadow-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-surface-200 rounded-card shadow-elevated py-1 z-50 animate-scaleUp">
                    <div className="px-4 py-2 border-b border-surface-100">
                      <p className="text-xs text-gray-500 font-normal">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile', 'history')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-surface-100 hover:text-primary-600 flex items-center gap-2.5"
                    >
                      <History className="w-4 h-4 text-gray-500" />
                      Attempt History
                    </button>

                    <button
                      onClick={() => handleNavClick('profile', 'teacher')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-surface-100 hover:text-primary-600 flex items-center gap-2.5"
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                      Teacher Dashboard
                    </button>

                    <button
                      onClick={openBuyCreditsModal}
                      className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2.5"
                    >
                      <Coins className="w-4 h-4 text-amber-600" />
                      Buy Credits ({credits} remaining)
                    </button>

                    <div className="border-t border-surface-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                        handleNavClick('home');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-card transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger & Quick User */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <button
              onClick={openBuyCreditsModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800"
            >
              <Coins className="w-3 h-3 text-amber-600" />
              <span>{credits}</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded-card hover:bg-surface-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-3 space-y-2 animate-fadeIn">
          {isLoggedIn ? (
            <div className="pb-2 mb-2 border-b border-surface-200">
              <div className="flex items-center gap-2.5 py-1">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-card flex items-center justify-center text-sm font-bold">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-card ${
              currentPage === 'home' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('config')}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-card flex items-center gap-2 ${
              currentPage === 'config' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            Create AI Quiz
          </button>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleNavClick('profile', 'history')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-card flex items-center gap-2 ${
                  currentPage === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <History className="w-4 h-4 text-gray-500" />
                Attempt History
              </button>

              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 rounded-card flex items-center gap-2"
              >
                <Share2 className="w-4 h-4 text-gray-500" />
                Teacher Dashboard
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openBuyCreditsModal();
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-50 rounded-card flex items-center gap-2"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                Buy Credits ({credits} available)
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                  handleNavClick('home');
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-card flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSignIn();
              }}
              className="w-full mt-2 py-2 text-center text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-card transition"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
