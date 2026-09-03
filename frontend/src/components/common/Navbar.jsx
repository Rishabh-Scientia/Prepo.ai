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
  ChevronDown,
  CreditCard
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
    <nav className="bg-white/95 backdrop-blur-md border-b border-surface-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 focus:outline-none group text-left"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
            <span className="text-white font-bold text-base">P</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">Prepo<span className="text-primary-600">.ai</span></span>
            <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
              AI MOCK TESTS
            </span>
            <span className="hidden lg:inline-block text-[11px] text-gray-400 font-medium pl-1.5 border-l border-surface-200">
              by <a href="https://your-bench-flax.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:opacity-80 transition"><strong className="text-emerald-600 font-extrabold">Your</strong> <strong className="text-gray-900 font-extrabold">Bench</strong></a>
            </span>
          </div>
        </button>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => handleNavClick('config')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              currentPage === 'config' 
                ? 'bg-primary-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${currentPage === 'config' ? 'text-primary-200' : 'text-primary-500'}`} />
            Create Test
          </button>

          {isLoggedIn ? (
            <>
              {/* Credits Badge */}
              <button
                onClick={openBuyCreditsModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 rounded-lg text-xs font-bold text-amber-800 transition-all hover:shadow-sm group"
                title="Click to buy more credits"
              >
                <Coins className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>{credits} Credits</span>
                <PlusCircle className="w-3.5 h-3.5 text-amber-500/70 group-hover:text-amber-600" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-lg transition-all focus:outline-none ${
                    isDropdownOpen
                      ? 'bg-primary-50 border border-primary-200 shadow-sm'
                      : 'hover:bg-surface-100 border border-transparent hover:border-surface-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate hidden lg:inline">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-surface-200 rounded-xl shadow-elevated overflow-hidden z-50 animate-scaleUp">
                    {/* User Info Header */}
                    <div className="px-4 py-3.5 bg-gradient-to-r from-surface-50 to-surface-100 border-b border-surface-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <button
                        onClick={() => handleNavClick('profile', 'history')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-3 transition-colors"
                      >
                        <History className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Attempt History</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('profile', 'teacher')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-3 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Teacher Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openBuyCreditsModal();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Buy Credits</span>
                        <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{credits}</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-surface-200 py-1.5">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                          handleNavClick('home');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={openSignIn}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all shadow-sm hover:shadow-md"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{credits}</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-surface-100 focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-3 space-y-1 animate-fadeIn shadow-lg">
          {isLoggedIn ? (
            <div className="pb-3 mb-2 border-b border-surface-200">
              <div className="flex items-center gap-3 py-1.5">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'home' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-surface-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('config')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
              currentPage === 'config' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-surface-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            Create AI Quiz
          </button>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleNavClick('profile', 'history')}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                  currentPage === 'profile' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-surface-50'
                }`}
              >
                <History className="w-4 h-4 text-gray-400" />
                Attempt History
              </button>

              <button
                onClick={() => handleNavClick('profile', 'teacher')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg flex items-center gap-2.5 hover:bg-surface-50 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                Teacher Dashboard
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openBuyCreditsModal();
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-amber-700 bg-amber-50/70 rounded-lg flex items-center gap-2.5 border border-amber-100"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                Buy Credits ({credits} available)
              </button>

              <div className="pt-2 border-t border-surface-200 mt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                    handleNavClick('home');
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSignIn();
              }}
              className="w-full mt-2 py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg transition shadow-sm"
            >
              Sign In / Sign Up
            </button>
          )}

          {/* Mobile Footer Your Bench Attribution & Links */}
          <div className="pt-3 mt-3 border-t border-surface-200 text-center">
            <p className="text-[11px] text-gray-500 mb-2">
              A <strong className="font-extrabold"><span className="text-emerald-600">Your</span> <span className="text-gray-900">Bench</span></strong> Product
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
              <a href="https://your-bench-flax.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition">Website</a>
              <span>•</span>
              <a href="https://www.instagram.com/your.bench" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition">Instagram</a>
              <span>•</span>
              <a href="https://www.linkedin.com/company/yourbench/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition">LinkedIn</a>
              <span>•</span>
              <a href="mailto:yoursbench@gmail.com" className="hover:text-primary-600 transition">Email</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
