'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MapPin, 
  Tag, 
  Building,
  Image as ImageIcon 
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
  limit: number;
  totalPages: number;
}

// --- Reusable UI Components (replace with your own) ---
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

const Button = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button 
    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

// --- Detailed Issue Card Component ---
const DetailedIssueCard = ({ issue }: { issue: FullIssue }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'in_progress':
      case 'assigned':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'reported':
      case 'acknowledged':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => (
    <div className="flex items-center gap-2">
      <AlertTriangle size={16} className={
        priority === 'critical' ? 'text-red-600' :
        priority === 'high' ? 'text-orange-500' :
        'text-yellow-500'
      } />
      <span className="capitalize">{priority}</span>
    </div>
  );

  return (
    <div className="border rounded-lg p-6 shadow-sm space-y-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-xl">{issue.title}</h2>
        {getStatusBadge(issue.status)}
      </div>
      
      {/* Meta Info */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2"><MapPin size={16} /> {issue.address}</div>
        <div className="flex items-center gap-2"><Tag size={16} /> {issue.category}</div>
        {getPriorityIcon(issue.priority)}
      </div>

      {/* Description */}
      <div className="text-gray-700 pt-2">
        <p>{issue.description}</p>
      </div>

      {/* Media Attachments */}
      {issue.media.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Attachments</h4>
          <div className="flex gap-2">
            {issue.media.map((item, index) => (
              <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Assignment and Dates */}
      <div className="border-t pt-4 mt-4 flex justify-between items-center text-xs text-gray-500">
        <div>
          {issue.assignedTo?.department?.name && (
            <div className="flex items-center gap-2">
              <Building size={14} /> 
              Assigned to: <strong>{issue.assignedTo.department.name}</strong>
            </div>
          )}
        </div>
        <div>
          <p>Reported: {new Date(issue.createdAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(issue.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const MyIssuesPage = () => {
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
        const response = await fetch(`/api/issues/me?page=${page}&limit=5&sortBy=createdAt&sortOrder=desc`);
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to fetch your issues.');
        }
        const data = await response.json();
        setIssues(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
  }, [page]);

  const renderContent = () => {
    if (loading) return <p className="text-center p-8">Loading your issues...</p>;
    if (error) return <p className="text-center p-8 text-red-600">Error: {error}</p>;
    if (issues.length === 0) return <p className="text-center p-8">You have not reported any issues yet.</p>;

    return (
      <div className="space-y-6">
        {issues.map((issue) => (
          <DetailedIssueCard key={issue._id} issue={issue} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Reported Issues</h1>
      
      {renderContent()}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyIssuesPage;