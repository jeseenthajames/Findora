import React from 'react';

export const ReportTypeBadge = ({ type }) => {
  const isLost = type?.toLowerCase() === 'lost';
  return (
    <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      {isLost ? 'Lost Item' : 'Found Item'}
    </span>
  );
};

export const ItemStatusBadge = ({ status }) => {
  switch (status) {
    case 'open':
      return <span className="badge badge-open">Open</span>;
    case 'claim_pending':
      return <span className="badge badge-claim-pending">Claim Pending</span>;
    case 'resolved':
      return <span className="badge badge-resolved">Resolved</span>;
    case 'approved':
      return <span className="badge badge-approved">Approved</span>;
    case 'rejected':
      return <span className="badge badge-rejected">Rejected</span>;
    default:
      return <span className="badge badge-open">{status || 'Open'}</span>;
  }
};
