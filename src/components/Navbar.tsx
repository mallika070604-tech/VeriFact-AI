import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Moon, Sun, Globe, Menu, X, User as UserIcon, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                VeriFact
              </span>
              <span className="text-xs px-1.5 py-0.5 font-mono font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors ${
              isActive('/') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/analyze"
            className={`transition-colors ${
              isActive('/analyze') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.analyze')}
          </Link>
          <Link
            to="/history"
            className={`transition-colors ${
              isActive('/history') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.history')}
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive('/dashboard') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('nav.dashboard')}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors ${
                isActive('/admin') ? 'font-semibold' : ''
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <Link
            to="/about"
            className={`transition-colors ${
              isActive('/about') ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('nav.about')}
          </Link>
        </nav>

        {/* Controls & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Auth Button or User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 text-sm font-medium text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 hover:text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-lg shadow-md shadow-indigo-500/20 transition-all"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
            >
              {t('nav.analyze')}
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
            >
              {t('nav.history')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
              >
                {t('nav.dashboard')}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-purple-400 hover:bg-slate-800 text-sm font-medium"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 text-sm font-medium"
            >
              {t('nav.about')}
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Globe className="w-4 h-4 text-cyan-400" />
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-xs text-white font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
