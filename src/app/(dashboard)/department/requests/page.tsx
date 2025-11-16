"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkerRequest {
  _id: string;
  employeeId: string;
  role: string;
  approvalStatus: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  department: {
    _id: string;
    name: string;
    shortCode: string;
  };
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  createdAt?: string;
}

const WorkersPage = () => {
  const { data: session, status } = useSession();
  const [workers, setWorkers] = useState<WorkerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [department, setDepartment] = useState<{
    _id: string;
    name: string;
    shortCode: string;
  } | null>(null);

  const fetchPendingWorkers = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/departments/get-pending-workers");
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkers(data.data || []);
        setDepartment(data.department || null);
      } else {
        setError(data.error || "Failed to fetch worker requests");
      }
    } catch (err) {
      setError("Failed to fetch worker requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const handleStatusChange = async (
    workerId: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    setActionLoading(workerId + approvalStatus);
    setError("");
    try {
      const res = await fetch("/api/departments/update-employee-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, approvalStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchPendingWorkers();
      } else {
        setError(data.error || "Failed to update worker status");
      }
    } catch (err) {
      setError("Failed to update worker status");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
      approved: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      "Team Member": "bg-blue-100 text-blue-700",
      Supervisor: "bg-purple-100 text-purple-700",
      Manager: "bg-indigo-100 text-indigo-700",
      "Department Head": "bg-orange-100 text-orange-700",
    };

    return (
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-700"}>
        <Briefcase className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error && !department) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Worker Registration Requests"
        subtitle={
          department
            ? `Manage worker requests for ${department.name} (${department.shortCode})`
            : "Manage worker registration requests"
        }
      />

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {workers.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          No pending worker requests found.
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker: WorkerRequest) => (
                  <TableRow key={worker._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {worker.userId?.fullName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {worker.employeeId}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(worker.role)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {worker.userId?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-700">
                              {worker.userId.email}
                            </span>
                          </div>
                        )}
                        {worker.userId?.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-700">
                              {worker.userId.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {worker.address ? (
                        <div className="space-y-1 text-sm">
                          {worker.address.street && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-700">
                                {worker.address.street}
                              </span>
                            </div>
                          )}
                          {(worker.address.city || worker.address.pincode) && (
                            <div className="text-gray-600">
                              {[worker.address.city, worker.address.pincode]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(worker.approvalStatus)}
                    </TableCell>
                    <TableCell>
                      {worker.createdAt ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(worker.createdAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={actionLoading === worker._id + "approved"}
                          onClick={() =>
                            handleStatusChange(worker._id, "approved")
                          }
                        >
                          {actionLoading === worker._id + "approved"
                            ? "Approving..."
                            : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          disabled={actionLoading === worker._id + "rejected"}
                          onClick={() =>
                            handleStatusChange(worker._id, "rejected")
                          }
                        >
                          {actionLoading === worker._id + "rejected"
                            ? "Rejecting..."
                            : "Reject"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersPage;
