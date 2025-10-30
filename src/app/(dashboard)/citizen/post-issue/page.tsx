"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import {
  MapPin,
  AlertCircle,
  FileText,
  Image,
  Brain,
  Sparkles,
  LocateFixed,
} from "lucide-react";

interface IssueFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  attachments: { url: string; id: string; originalName: string }[];
}

const PostIssuePage = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
    location: "",
    category: "",
    priority: "medium",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState("");

  const [aiAnalysis, setAiAnalysis] = useState<{
    category: string;
    confidence: number;
    description: string;
    tags: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsDetecting(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };
    // ------------------------------

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
            const address = data.features[0].place_name;

            setFormData((prevData) => ({
              ...prevData,
              location: address,
            }));
          } else {
            throw new Error("No address found for your location via Mapbox.");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        // The error message will be more specific now, e.g., "Timeout expired"
        setError(`Geolocation Error: ${err.message}`);
        setIsDetecting(false);
      },
      geoOptions
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (
    files: { url: string; id: string; originalName: string }[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const handleImageAnalysis = (analysis: {
    category: string;
    confidence: number;
    description: string;
    tags: string[];
  }) => {
    setAiAnalysis(analysis);
    setIsAnalyzing(false);

    if (analysis.confidence >= 0.7) {
      setFormData((prev) => ({
        ...prev,
        category: analysis.category,
        description: prev.description || analysis.description,
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const missing: string[] = [];
      if (!formData.title || !formData.title.trim()) missing.push("title");
      if (!formData.description || !formData.description.trim())
        missing.push("description");
      const loc = (formData.location || "").trim();
      if (!loc || loc.toLowerCase() === "detecting...")
        missing.push("location");
      if (!formData.category || !formData.category.trim())
        missing.push("category");

      if (missing.length > 0) {
        setSubmitMessage(
          `Please fill the required field(s): ${missing.join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/issues/post-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          reportedBy: session?.user?.id,
          reportedByName: session?.user?.name,
          reportedByEmail: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage("Issue reported successfully!");
        setFormData({
          title: "",
          description: "",
          location: "",
          category: "",
          priority: "medium",
          attachments: [],
        });
      } else {
        setSubmitMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setSubmitMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-200 backdrop:backdrop-blur-2xl rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Report an Issue
            </h1>
            <p className="text-gray-600">
              Help improve your city by reporting civic issues. Your report will
              be reviewed and addressed by the appropriate department.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Issue Title *
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                required
                className="mt-1"
              />
            </div>

            {/* Issue Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Detailed Description *
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about the issue, including any relevant context..."
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Location *
              </Label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={isDetecting ? "Detecting..." : formData.location}
                  onChange={handleInputChange}
                  placeholder="Street address, landmark, or area"
                  required
                  disabled={isDetecting}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800 focus:outline-none disabled:opacity-50"
                  aria-label="Detect current location"
                >
                  <LocateFixed className="h-4 w-4" />
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="pothole">Potholes</option>
                  <option value="streetlight">Street Lights</option>
                  <option value="garbage">Garbage Collection</option>
                  <option value="water">Water Issues</option>
                  <option value="road">Road Damage</option>
                  <option value="drainage">Drainage</option>
                  <option value="traffic">Traffic Signals</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-gray-700"
                >
                  Priority
                </Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Attachments (Optional)
              </Label>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Upload photos, documents, or other files related to this issue.
                Maximum 5 files, 10MB each.
              </p>

              <FileUpload
                onUploadComplete={handleFileUpload}
                onImageAnalyzed={handleImageAnalysis}
                maxFiles={5}
                acceptedFileTypes={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                  "application/pdf": [".pdf"],
                  "text/*": [".txt", ".doc", ".docx"],
                }}
              />

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-blue-800">
                      AI Analysis Results
                    </h4>
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        Suggested Category:
                      </span>
                      <span className="text-sm font-medium text-blue-800 capitalize">
                        {aiAnalysis.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Confidence:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${aiAnalysis.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-800">
                          {Math.round(aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-blue-700">
                        Description:
                      </span>
                      <p className="text-sm text-blue-800 mt-1">
                        {aiAnalysis.description}
                      </p>
                    </div>

                    {aiAnalysis.tags.length > 0 && (
                      <div>
                        <span className="text-sm text-blue-700">
                          Detected Tags:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aiAnalysis.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysis.confidence >= 0.7 && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Category auto-filled based on high confidence analysis
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show uploaded files */}
              {formData.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files:
                  </h4>
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {file.url.includes("image") ? (
                            <Image className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700">
                            {file.originalName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Submit Issue Report</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`p-4 rounded-lg ${
                  submitMessage.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostIssuePage;
