"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { FileUpload } from "@/components/ui/file-upload";
import { ROLES } from "@/components/common/constant";
import { LocateFixed } from "lucide-react";

interface UserData {
  _id?: string;
  fullName: string;
  email: string;
  userType: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FieldStaffData {
  _id?: string;
  userId: string | { _id: string };
  employeeId: string;
  department: string | { _id: string; name: string; shortCode: string };
  role: string;
  address?: {
    street?: string;
    city?: string;
    pincode?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

interface Department {
  _id: string;
  name: string;
  shortCode: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fieldStaffData, setFieldStaffData] = useState<FieldStaffData | null>(
    null
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [seekingApproval, setSeekingApproval] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    employeeId: "",
    department: "",
    role: "",
    street: "",
    city: "",
    pincode: "",
    profilePicture: "",
    password: "",
    confirmPassword: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [response, response2, response3] = await Promise.all([
          fetch("/api/user/get-info"),
          fetch("/api/field_staff/get-info"),
          fetch("/api/departments/get-all-departments"),
        ]);

        const result = await response.json();
        const result2 = await response2.json();
        let departmentsData: Department[] = [];

        try {
          const result3 = await response3.json();
          if (result3.success && result3.data) {
            departmentsData = result3.data;
          }
        } catch (e) {
          console.warn("Failed to fetch departments:", e);
        }
        setDepartments(departmentsData);

        if (result2.success && result2.data) {
          setFieldStaffData(result2.data);
          const fieldStaff = result2.data;
          const deptId =
            typeof fieldStaff.department === "object"
              ? fieldStaff.department._id
              : fieldStaff.department;

          setFormData((prev) => ({
            ...prev,
            employeeId: fieldStaff.employeeId || "",
            department: deptId || "",
            role: fieldStaff.role || "",
            street: fieldStaff.address?.street || "",
            city: fieldStaff.address?.city || "",
            pincode: fieldStaff.address?.pincode || "",
            latitude: fieldStaff.location?.coordinates?.[1]?.toString() || "",
            longitude: fieldStaff.location?.coordinates?.[0]?.toString() || "",
          }));
        } else {
          setMessage({
            type: "error",
            text: result2.error || "Failed to fetch field staff data",
          });
        }

        if (result.success && result.data) {
          setUserData(result.data);
          setFormData((prev) => ({
            ...prev,
            fullName: result.data.fullName || "",
            phoneNumber: result.data.phoneNumber || "",
            profilePicture: result.data.profilePicture || "",
          }));
        } else {
          setMessage({
            type: "error",
            text: result.error || "Failed to fetch user data",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ type: "error", text: "Failed to fetch user data" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsDetecting(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
          const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`;

          console.log("Requesting URL:", apiUrl);

          const response = await fetch(apiUrl);
          const data = await response.json();

          console.log("Mapbox API Response:", data);

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const address = feature.place_name;

            // Extract city and pincode from context
            let city = "";
            let pincode = "";

            if (feature.context) {
              const placeContext = feature.context.find((c: any) =>
                c.id.startsWith("place")
              );
              const postcodeContext = feature.context.find((c: any) =>
                c.id.startsWith("postcode")
              );

              city = placeContext ? placeContext.text : "";
              pincode = postcodeContext ? postcodeContext.text : "";
            }

            // Update form with detected location
            setFormData((prev) => ({
              ...prev,
              street: address,
              city: city || prev.city,
              pincode: pincode || prev.pincode,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));

            setMessage({
              type: "success",
              text: "Location detected successfully!",
            });
          } else {
            throw new Error("No address found for your location via Mapbox.");
          }
        } catch (err) {
          setLocationError(err.message);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setLocationError(`Geolocation Error: ${err.message}`);
        setIsDetecting(false);
      },
      geoOptions
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Full name cannot exceed 100 characters";
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (formData.employeeId && !formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be a valid 6-digit number";
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setUpdating(true);

    try {
      // Prepare user update payload
      const userUpdatePayload: any = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        profilePicture: formData.profilePicture.trim() || undefined,
      };

      // Only include password if it's provided
      if (formData.password) {
        userUpdatePayload.password = formData.password;
      }

      // Prepare field staff update payload
      const fieldStaffUpdatePayload: any = {
        employeeId: formData.employeeId.trim(),
        department: formData.department.trim(),
        role: formData.role.trim(),
        address: {
          street: formData.street.trim() || undefined,
          city: formData.city.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
        },
        seekApproval: seekingApproval,
      };

      // Add location if provided
      if (formData.latitude && formData.longitude) {
        fieldStaffUpdatePayload.location = {
          coordinates: [
            parseFloat(formData.longitude),
            parseFloat(formData.latitude),
          ],
        };
      }

      // Update both user and field staff profile
      const [userResponse, fieldStaffResponse] = await Promise.all([
        fetch("/api/user/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userUpdatePayload),
        }),
        fetch("/api/field_staff/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fieldStaffUpdatePayload),
        }),
      ]);

      const userResult = await userResponse.json();
      const fieldStaffResult = await fieldStaffResponse.json();

      if (userResult.success && fieldStaffResult.success) {
        setMessage({
          type: "success",
          text:
            fieldStaffResult.message ||
            userResult.message ||
            "Profile updated successfully!",
        });

        // Update user data with new data
        if (userResult.data) {
          setUserData(userResult.data);
        }

        if (fieldStaffResult.data) {
          setFieldStaffData(fieldStaffResult.data);
        }

        // Clear password fields and reset seeking approval
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setSeekingApproval(false);

        // Refresh session to update user data
        if (session) {
          await fetch("/api/auth/session", { method: "GET" });
        }
      } else {
        const errorMessage =
          fieldStaffResult.error ||
          userResult.error ||
          "Failed to update profile";
        setMessage({
          type: "error",
          text: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load user data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-8 px-6">
        <h1 className="tracking-wide font-medium text-3xl font-clash">
          Settings
        </h1>
      </div>
      <div className="pt-8 max-w-4xl mx-auto px-4 pb-12 border rounded-lg p-10 border-gray-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              {/* Message Display */}
              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Full Name */}
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName && (
                      <FieldError>{errors.fullName}</FieldError>
                    )}
                  </FieldContent>
                </Field>

                {/* Email (Read-only) */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                  </FieldContent>
                </Field>
              </div>

              {/* Phone Number and Employee ID */}
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                  <FieldContent>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      aria-invalid={!!errors.phoneNumber}
                    />
                    {errors.phoneNumber && (
                      <FieldError>{errors.phoneNumber}</FieldError>
                    )}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
                  <FieldContent>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="Enter employee ID"
                      aria-invalid={!!errors.employeeId}
                    />
                    {errors.employeeId && (
                      <FieldError>{errors.employeeId}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              </div>

              {/* Department and Role */}
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <FieldContent>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Departments</SelectLabel>
                          {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                              {dept.name} ({dept.shortCode})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <FieldError>{errors.department}</FieldError>
                    )}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <FieldContent>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="Team Member">
                            Team Member
                          </SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Department Head">
                            Department Head
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.role && <FieldError>{errors.role}</FieldError>}
                  </FieldContent>
                </Field>
              </div>

              {/* Approval Status Display */}
              {fieldStaffData && (
                <Field>
                  <FieldLabel>Approval Status</FieldLabel>
                  <FieldContent>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        fieldStaffData.approvalStatus === "approved"
                          ? "bg-green-100 text-green-800"
                          : fieldStaffData.approvalStatus === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {fieldStaffData.approvalStatus === "approved"
                        ? "✓ Approved"
                        : fieldStaffData.approvalStatus === "rejected"
                        ? "✗ Rejected"
                        : "⏳ Pending"}
                    </div>
                    {fieldStaffData.approvalStatus !== "approved" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Update your profile information and request approval
                        from your department.
                      </p>
                    )}
                  </FieldContent>
                </Field>
              )}

              {/* Address Section with Auto-detect */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  <Button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LocateFixed className="h-4 w-4" />
                    {isDetecting ? "Detecting..." : "Auto-detect Location"}
                  </Button>
                </div>
                {locationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{locationError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="street">Street Address</FieldLabel>
                    <FieldContent>
                      <Input
                        id="street"
                        name="street"
                        type="text"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
                        disabled={isDetecting}
                      />
                    </FieldContent>
                  </Field>
                  <div className="flex items-center gap-4">
                    <Field>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <FieldContent>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          disabled={isDetecting}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
                      <FieldContent>
                        <Input
                          id="pincode"
                          name="pincode"
                          type="text"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          aria-invalid={!!errors.pincode}
                          disabled={isDetecting}
                        />
                        {errors.pincode && (
                          <FieldError>{errors.pincode}</FieldError>
                        )}
                      </FieldContent>
                    </Field>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="text-xs text-gray-500 mt-2">
                      Coordinates: {parseFloat(formData.latitude).toFixed(6)},{" "}
                      {parseFloat(formData.longitude).toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Picture */}
              <Field>
                <FieldLabel htmlFor="profilePicture">
                  Profile Picture
                </FieldLabel>
                <FieldContent>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {formData.profilePicture && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 relative flex-shrink-0">
                          <img
                            src={formData.profilePicture}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Current Profile Picture
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                profilePicture: "",
                              }));
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {/* File Upload Component */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a new profile picture (max 1 image, 10MB)
                      </p>
                      <FileUpload
                        onUploadComplete={(
                          files: {
                            url: string;
                            id: string;
                            originalName: string;
                          }[]
                        ) => {
                          if (files.length > 0) {
                            // Use the first uploaded file's URL
                            setFormData((prev) => ({
                              ...prev,
                              profilePicture: files[0].url,
                            }));
                            // Clear any errors
                            if (errors.profilePicture) {
                              setErrors((prev) => ({
                                ...prev,
                                profilePicture: "",
                              }));
                            }
                          }
                        }}
                        maxFiles={1}
                        acceptedFileTypes={{
                          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                        }}
                      />
                    </div>

                    {errors.profilePicture && (
                      <FieldError>{errors.profilePicture}</FieldError>
                    )}
                  </div>
                </FieldContent>
              </Field>

              {/* Password Section */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Leave blank if you don&apos;t want to change your password
                </p>

                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password (min 8 characters)"
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <FieldError>{errors.password}</FieldError>
                    )}
                  </FieldContent>
                </Field>

                {/* Confirm Password */}
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm New Password
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <FieldError>{errors.confirmPassword}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              </div>

              {/* Seek Approval Checkbox */}
              {fieldStaffData &&
                fieldStaffData.approvalStatus !== "approved" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="seekApproval"
                        checked={seekingApproval}
                        onChange={(e) => setSeekingApproval(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label
                        htmlFor="seekApproval"
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Request approval from department after updating profile
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      Check this box if you want to request approval from your
                      department after saving changes.
                    </p>
                  </div>
                )}

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:w-auto"
                >
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
