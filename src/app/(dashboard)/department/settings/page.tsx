"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import Heading from "@/components/common/Heading";

interface DepartmentData {
  _id?: string;
  name: string;
  shortCode: string;
  contactEmail?: string;
  contactPhone?: string;
  operatingHours?: string;
  slas?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  headId?: string;
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function DepartmentSettingsPage() {
  const { data: session } = useSession();
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    contactEmail: "",
    contactPhone: "",
    operatingHours: "",
    slaLow: "",
    slaMedium: "",
    slaHigh: "",
    slaCritical: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch department data on mount
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await fetch("/api/departments/get-info");
        const result = await response.json();

        if (result.success && result.data) {
          setDepartmentData(result.data);
          setFormData({
            name: result.data.name || "",
            shortCode: result.data.shortCode || "",
            contactEmail: result.data.contactEmail || "",
            contactPhone: result.data.contactPhone || "",
            operatingHours: result.data.operatingHours || "",
            slaLow: result.data.slas?.low?.toString() || "",
            slaMedium: result.data.slas?.medium?.toString() || "",
            slaHigh: result.data.slas?.high?.toString() || "",
            slaCritical: result.data.slas?.critical?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Error fetching department data:", error);
        setMessage({
          type: "error",
          text: "Failed to load department data",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDepartmentData();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
    }

    if (!formData.shortCode.trim()) {
      newErrors.shortCode = "Short code is required";
    } else if (formData.shortCode.length > 10) {
      newErrors.shortCode = "Short code must be 10 characters or less";
    }

    if (formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.contactEmail.trim())) {
        newErrors.contactEmail = "Invalid email format";
      }
    }

    if (formData.contactPhone && formData.contactPhone.trim()) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.contactPhone.trim())) {
        newErrors.contactPhone = "Phone number must be 10 digits";
      }
    }

    // Validate SLA values
    const slaFields = ["slaLow", "slaMedium", "slaHigh", "slaCritical"];
    slaFields.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (value && value.trim()) {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = "Must be a non-negative number";
        }
      }
    });

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
      // Prepare department update payload
      const departmentPayload: any = {
        name: formData.name.trim(),
        shortCode: formData.shortCode.trim(),
        contactEmail: formData.contactEmail.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        operatingHours: formData.operatingHours.trim() || undefined,
      };

      // Add SLAs if any are provided
      const slas: any = {};
      if (formData.slaLow.trim()) {
        slas.low = Number(formData.slaLow);
      }
      if (formData.slaMedium.trim()) {
        slas.medium = Number(formData.slaMedium);
      }
      if (formData.slaHigh.trim()) {
        slas.high = Number(formData.slaHigh);
      }
      if (formData.slaCritical.trim()) {
        slas.critical = Number(formData.slaCritical);
      }

      if (Object.keys(slas).length > 0) {
        departmentPayload.slas = slas;
      }

      const response = await fetch("/api/departments/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departmentPayload),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Department profile updated successfully!",
        });

        // Update department data with new data
        if (result.data) {
          setDepartmentData(result.data);
          setFormData({
            name: result.data.name || "",
            shortCode: result.data.shortCode || "",
            contactEmail: result.data.contactEmail || "",
            contactPhone: result.data.contactPhone || "",
            operatingHours: result.data.operatingHours || "",
            slaLow: result.data.slas?.low?.toString() || "",
            slaMedium: result.data.slas?.medium?.toString() || "",
            slaHigh: result.data.slas?.high?.toString() || "",
            slaCritical: result.data.slas?.critical?.toString() || "",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update department profile",
        });
      }
    } catch (error) {
      console.error("Error updating department:", error);
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container mx-auto mt-10 p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container mx-auto mt-10 p-6">
      <Heading
        title="Department Settings"
        subtitle={
          departmentData
            ? "Update your department profile information"
            : "Create your department profile"
        }
      />

      <div className="mt-6 max-w-4xl border rounded-lg p-10 border-gray-200">
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

              {/* Department Name and Short Code */}
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Department Name *</FieldLabel>
                  <FieldContent>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter department name"
                      aria-invalid={!!errors.name}
                      required
                    />
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="shortCode">Short Code *</FieldLabel>
                  <FieldContent>
                    <Input
                      id="shortCode"
                      name="shortCode"
                      type="text"
                      value={formData.shortCode}
                      onChange={handleInputChange}
                      placeholder="e.g., IT, HR, FIN"
                      maxLength={10}
                      aria-invalid={!!errors.shortCode}
                      required
                      className="uppercase"
                    />
                    {errors.shortCode && (
                      <FieldError>{errors.shortCode}</FieldError>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum 10 characters, will be converted to uppercase
                    </p>
                  </FieldContent>
                </Field>
              </div>

              {/* Contact Email and Phone */}
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="contactEmail">Contact Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="department@example.com"
                      aria-invalid={!!errors.contactEmail}
                    />
                    {errors.contactEmail && (
                      <FieldError>{errors.contactEmail}</FieldError>
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="contactPhone">Contact Phone</FieldLabel>
                  <FieldContent>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                      maxLength={10}
                      aria-invalid={!!errors.contactPhone}
                    />
                    {errors.contactPhone && (
                      <FieldError>{errors.contactPhone}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              </div>

              {/* Operating Hours */}
              <Field>
                <FieldLabel htmlFor="operatingHours">
                  Operating Hours
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    value={formData.operatingHours}
                    onChange={handleInputChange}
                    placeholder="e.g., Mon-Fri: 9 AM - 5 PM"
                  />
                </FieldContent>
              </Field>

              {/* SLA Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Service Level Agreements (SLAs) - Hours
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="slaLow">
                      Low Priority (hours)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="slaLow"
                        name="slaLow"
                        type="number"
                        value={formData.slaLow}
                        onChange={handleInputChange}
                        placeholder="e.g., 48"
                        min="0"
                        step="1"
                        aria-invalid={!!errors.slaLow}
                      />
                      {errors.slaLow && (
                        <FieldError>{errors.slaLow}</FieldError>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="slaMedium">
                      Medium Priority (hours)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="slaMedium"
                        name="slaMedium"
                        type="number"
                        value={formData.slaMedium}
                        onChange={handleInputChange}
                        placeholder="e.g., 24"
                        min="0"
                        step="1"
                        aria-invalid={!!errors.slaMedium}
                      />
                      {errors.slaMedium && (
                        <FieldError>{errors.slaMedium}</FieldError>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="slaHigh">
                      High Priority (hours)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="slaHigh"
                        name="slaHigh"
                        type="number"
                        value={formData.slaHigh}
                        onChange={handleInputChange}
                        placeholder="e.g., 12"
                        min="0"
                        step="1"
                        aria-invalid={!!errors.slaHigh}
                      />
                      {errors.slaHigh && (
                        <FieldError>{errors.slaHigh}</FieldError>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="slaCritical">
                      Critical Priority (hours)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="slaCritical"
                        name="slaCritical"
                        type="number"
                        value={formData.slaCritical}
                        onChange={handleInputChange}
                        placeholder="e.g., 4"
                        min="0"
                        step="1"
                        aria-invalid={!!errors.slaCritical}
                      />
                      {errors.slaCritical && (
                        <FieldError>{errors.slaCritical}</FieldError>
                      )}
                    </FieldContent>
                  </Field>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={updating}
                  className="min-w-[120px]"
                >
                  {updating
                    ? "Saving..."
                    : departmentData
                    ? "Update Department"
                    : "Create Department"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
