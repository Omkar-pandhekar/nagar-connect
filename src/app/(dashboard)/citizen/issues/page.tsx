'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Tag, 
  Building,
  MoreHorizontal,
  UserCircle2,
  CameraOff
} from 'lucide-react';

// --- Type Definitions (matching your Mongoose model) ---
interface Media {
  url: string;
  type: 'image' | 'video' | 'audio';
}

interface Department {
  _id: string;
  name: string;
}

interface FullIssue {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  address: string;
  media: Media[];
  assignedTo?: {
    department?: Department;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

// --- Reusable UI Components ---
const Button = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button 
    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

// --- Instagram-style Issue Post Component ---
const InstagramIssuePost = ({ issue }: { issue: FullIssue }) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      resolved: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      assigned: "bg-yellow-100 text-yellow-800",
      reported: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };
    return <Badge className={styles[status as keyof typeof styles] || styles.default}>{status}</Badge>;
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg w-full max-w-lg">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <UserCircle2 size={32} className="text-gray-500" />
          <div>
            <p className="font-bold text-sm">Your Report</p>
            <p className="text-xs text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <MoreHorizontal size={24} className="text-gray-600" />
      </div>

      {/* Post Media */}
      <div className="w-full aspect-square bg-gray-100">
        {issue.media.length > 0 ? (
          <img 
            src={issue.media[0].url} 
            alt={issue.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <CameraOff size={48} />
          </div>
        )}
      </div>

      {/* Post Content & Caption */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          {getStatusBadge(issue.status)}
          <div className="flex items-center gap-2 text-sm">
             <AlertTriangle size={16} className={
               issue.priority === 'critical' ? 'text-red-600' :
               issue.priority === 'high' ? 'text-orange-500' :
               'text-yellow-500'
             } />
             <span className="capitalize font-medium">{issue.priority} Priority</span>
           </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin size={16} /> {issue.address}
        </div>

        <p className="text-sm">
          <span className="font-bold">{issue.title}</span>
          <span className="text-gray-700"> — {issue.description}</span>
        </p>
        
        <p className="text-xs text-blue-800 font-semibold cursor-pointer">#{issue.category.replace(/\s+/g, '')}</p>

        {issue.assignedTo?.department?.name && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t mt-2">
            <Building size={14} /> 
            Assigned to: <strong>{issue.assignedTo.department.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Page Component ---
const MyIssuesFeedPage = () => {
  const [issues, setIssues] = useState<FullIssue[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        // NOTE: I've updated the API endpoint to match the one in your code.
        const response = await fetch(`/api/issues/get-issue/me?page=${page}&limit=5`);
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to fetch your issues.');
        }
        const data = await response.json();
        // Append new issues to the existing list for an infinite scroll feel
        setIssues(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setPagination(data.pagination);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
  }, [page]);

  const loadMore = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="w-full bg-gray-50 flex justify-center py-8">
      <div className="w-full max-w-lg px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center">My Reported Issues</h1>

        {issues.map((issue) => (
          <InstagramIssuePost key={issue._id} issue={issue} />
        ))}
        
        {loading && <p className="text-center p-8">Loading...</p>}
        {error && <p className="text-center p-8 text-red-600">Error: {error}</p>}
        
        {!loading && pagination && page < pagination.totalPages && (
           <div className="text-center">
             <Button onClick={loadMore}>Load More</Button>
           </div>
        )}

        {!loading && issues.length === 0 && (
          <p className="text-center p-8 text-gray-600">You have not reported any issues yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyIssuesFeedPage;