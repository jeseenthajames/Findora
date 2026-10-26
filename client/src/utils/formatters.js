export const CATEGORIES = [
  'ID Cards & Documents',
  'Electronics',
  'Keys',
  'Bags & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bottles & Containers',
  'Other'
];

export const CAMPUS_LOCATIONS = [
  'Main University Library',
  'Student Union / Dining Center',
  'Science & Engineering Complex',
  'Mathematics & Computing Hall',
  'Humanities & Arts Building',
  'Campus Recreation Center & Gym',
  'Administrative Building',
  'Campus Grounds / Courtyard',
  'Dormitory & Residential Village',
  'Other Campus Location'
];

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getCategoryColor = (category) => {
  switch (category) {
    case 'ID Cards & Documents':
      return { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' };
    case 'Electronics':
      return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' };
    case 'Keys':
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    case 'Bags & Wallets':
      return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
    case 'Books & Stationery':
      return { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' };
    case 'Clothing & Accessories':
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    case 'Bottles & Containers':
      return { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  }
};
