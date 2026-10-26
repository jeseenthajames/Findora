import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, HelpCircle, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--navy-950)',
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--teal-700)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Findora
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1rem' }}>
              Centralized campus lost-and-found management system. Helping students and staff recover lost items safely and quickly.
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#5eead4', fontStyle: 'italic' }}>
              "Lost something? Let's bring it back."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
              <Link to="/browse" style={{ color: '#94a3b8', textDecoration: 'none' }}>Browse All Items</Link>
              <Link to="/report-lost" style={{ color: '#94a3b8', textDecoration: 'none' }}>Report a Lost Item</Link>
              <Link to="/report-found" style={{ color: '#94a3b8', textDecoration: 'none' }}>Report a Found Item</Link>
              <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>User Dashboard</Link>
            </div>
          </div>

          {/* Campus Support */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Campus Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
                <span>Student Union, Room 114</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={15} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
                <span>Campus Safety &amp; Security</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={15} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
                <span>Hours: Mon - Fri 8am - 6pm</span>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Safety &amp; Privacy
            </h4>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#94a3b8' }}>
              Findora safeguards student privacy. Personal phone numbers and private emails are never exposed publicly. Claims require verified ownership review.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div
          style={{
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8125rem'
          }}
        >
          <p style={{ color: '#64748b' }}>
            &copy; {new Date().getFullYear()} Findora Campus Lost-and-Found Management System. Built with MERN Stack.
          </p>
          <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Designed for college campus communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
