"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Heading from "@/components/common/Heading";
import {
  User2,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  RefreshCw,
  Users,
  Building2,
  MapPin,
  IdCard,
  Check,
  X,
} from "lucide-react";

interface Department {
  _id: string;
  name: string;
  shortCode: string;
}

interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
}

interface FieldStaff {
  _id: string;
  userId: UserInfo;
  employeeId: string | null;
  department: Department;
  role: "Team Member" | "Supervisor" | "Manager" | "Department Head";
  approvalStatus: "pending" | "approved" | "rejected";
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

const FieldStaffManagementPage = () => {
  const [employees, setEmployees] = useState<FieldStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/departments/get-all-employees");
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(data.data);
      } else {
        setError(data.error || "Failed to fetch employees");
      }
    } catch {
      setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployeeId = async (fieldStaffId: string) => {
    if (!newEmployeeId.trim()) {
      toast.error("Please enter a valid employee ID");
      return;
    }

    setAssigningId(fieldStaffId);
    try {
      const res = await fetch("/api/departments/assign-employee-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldStaffId,
          employeeId: newEmployeeId.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update the employee in the list
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === fieldStaffId
              ? { ...emp, employeeId: newEmployeeId.trim().toUpperCase() }
              : emp
          )
        );
        setEditingId(null);
        setNewEmployeeId("");
        toast.success("Employee ID assigned successfully!");
      } else {
        toast.error(data.error || "Failed to assign employee ID");
      }
    } catch {
      toast.error("Failed to assign employee ID. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };

  const handleEditClick = (employeeId: string, currentId: string | null) => {
    setEditingId(employeeId);
    setNewEmployeeId(currentId || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewEmployeeId("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      "Department Head": "bg-purple-100 text-purple-700",
      Manager: "bg-blue-100 text-blue-700",
      Supervisor: "bg-indigo-100 text-indigo-700",
      "Team Member": "bg-gray-100 text-gray-700",
    };
    return (
      <Badge
        variant="outline"
        className={`text-xs ${
          colors[role as keyof typeof colors] || colors["Team Member"]
        }`}
      >
        <Briefcase className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  // Get unique departments for filter
  const uniqueDepartments = Array.from(
    new Set(employees.map((e) => e.department._id))
  ).map((id) => employees.find((e) => e.department._id === id)?.department);

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department._id === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || employee.approvalStatus === selectedStatus;
    return matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Field Staff Management"
        subtitle="Manage all field staff employees across departments"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employees
                </p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    employees.filter((e) => e.approvalStatus === "approved")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    employees.filter((e) => e.approvalStatus === "pending")
                      .length
                  }
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Without ID</p>
                <p className="text-2xl font-bold text-orange-600">
                  {employees.filter((e) => !e.employeeId).length}
                </p>
              </div>
              <IdCard className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept?._id} value={dept?._id}>
                    {dept?.name} ({dept?.shortCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDepartment("all");
                  setSelectedStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Field Staff Directory
              {filteredEmployees.length !== employees.length && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredEmployees.length} of {employees.length})
                </span>
              )}
            </span>
            <Button
              variant="outline"
              onClick={fetchEmployees}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {employees.length === 0
                ? "No field staff employees found."
                : "No employees match the selected filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow
                      key={employee._id}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {employee.userId.fullName}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {employee.userId.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingId === employee._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newEmployeeId}
                              onChange={(e) =>
                                setNewEmployeeId(e.target.value.toUpperCase())
                              }
                              placeholder="EMP-001"
                              className="w-32 h-8 text-sm"
                              disabled={assigningId === employee._id}
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAssignEmployeeId(employee._id)
                              }
                              disabled={
                                assigningId === employee._id ||
                                !newEmployeeId.trim()
                              }
                              className="h-8 w-8 p-0"
                            >
                              {assigningId === employee._id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={assigningId === employee._id}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {employee.employeeId || (
                                <span className="text-gray-400 italic">
                                  Not assigned
                                </span>
                              )}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditClick(
                                  employee._id,
                                  employee.employeeId
                                )
                              }
                              className="h-7 px-2 text-xs"
                            >
                              <IdCard className="w-3 h-3 mr-1" />
                              {employee.employeeId ? "Edit" : "Assign"}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {employee.department.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee.department.shortCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(employee.role)}</TableCell>
                      <TableCell>
                        {employee.address?.city ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <div>
                              <p>{employee.address.city}</p>
                              {employee.address.pincode && (
                                <p className="text-xs text-gray-500">
                                  {employee.address.pincode}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not provided
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(employee.approvalStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldStaffManagementPage;
