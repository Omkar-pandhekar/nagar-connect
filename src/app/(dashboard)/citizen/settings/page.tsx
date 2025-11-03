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
import { useSession } from "next-auth/react";
import { FileUpload } from "@/components/ui/file-upload";

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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    profilePicture: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/get-info");
        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
          setFormData({
            fullName: result.data.fullName || "",
            phoneNumber: result.data.phoneNumber || "",
            profilePicture: result.data.profilePicture || "",
            password: "",
            confirmPassword: "",
          });
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
      // Prepare update payload (exclude password if not provided)
      const updatePayload: any = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        profilePicture: formData.profilePicture.trim() || undefined,
      };

      // Only include password if it's provided
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile updated successfully!",
        });

        // Update user data with new data
        if (result.data) {
          setUserData(result.data);
          // Clear password fields
          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
          }));
        }

        // Refresh session to update user data
        if (session) {
          await fetch("/api/auth/session", { method: "GET" });
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile",
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
      <div className="pt-8 max-w-4xl mx-auto px-4 pb-12">
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
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </FieldContent>
              </Field>

              {/* Phone Number */}
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
