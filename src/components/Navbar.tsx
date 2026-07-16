import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  GraduationCap, Wallet, LogOut, MessageSquare, BookOpen, Users,
  LayoutDashboard, Menu, X, PlusCircle, Coins, Database, AlertTriangle,
  CheckCircle, RefreshCw, Sliders, Globe, HelpCircle, Sun, Moon
} from 'lucide-react';

interface NavbarProps {
  onOpenDeposit: () => void;
  onOpenNewAssignment: () => void;
}

export default function Navbar({ onOpenDeposit, onOpenNewAssignment }: NavbarProps) {
  const {
    currentUser,
    logout,
    isAuthenticated,
    tenantId,
    theme,
    toggleTheme
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Tutors', path: '/tutors', icon: Users },
    { name: 'Courses', path: '/courses', icon: BookOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isSelected = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-200" id="main_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 heading-font">
                Edu<span className="text-sky-600 font-medium">Solve</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex lg:ml-6 space-x-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isSelected(item.path)
                          ? 'bg-sky-50 text-sky-600 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side Desktop Controls */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/60 transition-all cursor-pointer flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme_toggle_btn"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Balance display for students, Earnings display for tutors */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-2xl p-1.5 pr-3.5">
                  <div className="p-1.5 bg-white rounded-xl shadow-sm text-sky-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block leading-none text-[10px] uppercase font-bold tracking-wider">
                      {currentUser?.role === 'student' ? 'Wallet Balance' : 'Earnings'}
                    </span>
                    <span className="font-semibold text-slate-700 leading-normal block">
                      ${currentUser?.balance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {currentUser?.role === 'student' && (
                    <button
                      onClick={onOpenDeposit}
                      className="ml-2 bg-sky-600 text-white text-xs px-2.5 py-1.5 rounded-xl hover:bg-sky-700 font-medium cursor-pointer transition-colors"
                      title="Deposit Funds"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {/* Post assignment action for students */}
                {currentUser?.role === 'student' && (
                  <button
                    onClick={onOpenNewAssignment}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded-xl shadow-sm font-medium cursor-pointer transition-colors duration-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Ask for Help
                  </button>
                )}

                {/* User card profile & Logout */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      className="w-8.5 h-8.5 rounded-full border border-slate-200 shadow-sm"
                    />
                    <div className="text-xs">
                      <span className="font-medium text-slate-800 block">{currentUser?.name}</span>
                      <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider block w-max mt-0.5">
                        {currentUser?.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth"
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?register=true"
                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 rounded-xl font-medium shadow-sm transition-colors"
                >
                  Join as Student/Tutor
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center lg:hidden gap-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/60 transition-all cursor-pointer flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme_toggle_mobile"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {isAuthenticated && currentUser?.role === 'student' && (
              <button
                onClick={onOpenNewAssignment}
                className="bg-slate-950 text-white p-2 rounded-xl"
                title="Post Assignment"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 p-2 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full left-0 transition-all duration-300">
          {isAuthenticated ? (
            <>
              {/* User Bio Card */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full border border-slate-200"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{currentUser?.name}</h4>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                </div>
                <span className="ml-auto text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {currentUser?.role}
                </span>
              </div>

              {/* Mobile Balance View */}
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-sky-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {currentUser?.role === 'student' ? 'Wallet Balance' : 'My Earnings'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">${currentUser?.balance?.toLocaleString()}</span>
                  {currentUser?.role === 'student' && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDeposit();
                      }}
                      className="bg-sky-600 text-white text-xs px-2.5 py-1 rounded-lg"
                    >
                      + Top Up
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${isSelected(item.path)
                          ? 'bg-sky-50 text-sky-600'
                          : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 bg-rose-50 rounded-xl text-base font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Logout Account
              </button>
            </>
          ) : (
            <div className="pt-2 pb-1 space-y-3">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-3 text-slate-700 bg-slate-100 rounded-xl font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/auth?register=true"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-3 text-white bg-sky-600 rounded-xl font-medium shadow-sm"
              >
                Join as Student/Tutor
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
