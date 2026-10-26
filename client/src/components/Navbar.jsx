import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  FileQuestion,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        backgroundColor: 'rgba(251, 250, 248, 0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--canvas-border)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={closeMenus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--navy-900)',
              color: '#5eead4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(10, 17, 40, 0.2)'
            }}
          >
            <Compass size={22} strokeWidth={2.2} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--navy-900)',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              Findora
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.6875rem',
                color: 'var(--teal-700)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Campus Lost &amp; Found
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          className="desktop-nav"
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--teal-700)' : 'var(--navy-900)',
              backgroundColor: isActive ? 'var(--teal-50)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/browse"
            style={({ isActive }) => ({
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--teal-700)' : 'var(--navy-900)',
              backgroundColor: isActive ? 'var(--teal-50)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            Browse Items
          </NavLink>

          <NavLink
            to="/report-lost"
            style={({ isActive }) => ({
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--lost-red)' : 'var(--navy-900)',
              backgroundColor: isActive ? 'var(--lost-bg)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            Report Lost
          </NavLink>

          <NavLink
            to="/report-found"
            style={({ isActive }) => ({
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--found-green)' : 'var(--navy-900)',
              backgroundColor: isActive ? 'var(--found-bg)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            Report Found
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? 'var(--teal-700)' : 'var(--navy-900)',
                backgroundColor: isActive ? 'var(--teal-50)' : 'transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              My Dashboard
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6d28d9',
                backgroundColor: isActive ? '#ede9fe' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all var(--transition-fast)'
              })}
            >
              <ShieldAlert size={15} />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--canvas-border)',
                  backgroundColor: 'var(--canvas-card)',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--teal-700)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--canvas-card)',
                    border: '1px solid var(--canvas-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 950
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--canvas-border)' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {user?.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '0.35rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: '#ede9fe',
                          color: '#6d28d9',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}
                      >
                        Campus Admin
                      </span>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--navy-900)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <LayoutDashboard size={16} />
                    My Reports &amp; Claims
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        color: '#6d28d9',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <ShieldAlert size={16} />
                      Moderation Portal
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--lost-red)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={15} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--navy-900)',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--navbar-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 17, 40, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 899
          }}
          onClick={closeMenus}
        >
          <div
            style={{
              backgroundColor: 'var(--canvas-card)',
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated && (
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--canvas-border)' }}>
                <p style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                Home
              </Link>
              <Link to="/browse" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                Browse Items
              </Link>
              <Link to="/report-lost" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--lost-red)' }}>
                Report Lost Item
              </Link>
              <Link to="/report-found" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--found-green)' }}>
                Report Found Item
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  My Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={closeMenus} style={{ padding: '0.5rem 0', fontWeight: 600, color: '#6d28d9' }}>
                  Admin Moderation
                </Link>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--canvas-border)' }}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ width: '100%', color: 'var(--lost-red)', borderColor: '#fca5a5' }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/login" onClick={closeMenus} className="btn btn-outline" style={{ width: '100%' }}>
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMenus} className="btn btn-primary" style={{ width: '100%' }}>
                    Register Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style for media queries */}
      <style>{`
        @media (min-width: 860px) {
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 859px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
