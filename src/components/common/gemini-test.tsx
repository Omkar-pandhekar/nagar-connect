"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Brain, Sparkles, AlertCircle } from "lucide-react";

const GeminiTestComponent = () => {
  const [analysis, setAnalysis] = useState<{
    category: string;
    confidence: number;
    description: string;
    tags: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageAnalysis = (analysisResult: {
    category: string;
    confidence: number;
    description: string;
    tags: string[];
  }) => {
    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    console.log("Gemini Analysis Result:", analysisResult);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gemini AI Image Analysis
            </h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-600">
            Upload an image of a civic issue and let Gemini AI automatically
            categorize it for you. The AI will analyze the image and suggest the
            appropriate issue category.
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Image
            </h3>
            <FileUpload
              onImageAnalyzed={handleImageAnalysis}
              maxFiles={1}
              acceptedFileTypes={{
                "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
              }}
            />
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-800">
                  Gemini Analysis Results
                </h3>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-blue-600">
                    Powered by Gemini 1.5 Flash
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Suggested Category:
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {analysis.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Confidence Score:
                    </label>
                    <div className="mt-2 flex items-center space-x-3">
                      <div className="flex-1 bg-blue-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${analysis.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-800 min-w-[3rem]">
                        {Math.round(analysis.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">
                      Description:
                    </label>
                    <p className="mt-1 text-sm text-blue-800 bg-white p-3 rounded-lg border border-blue-100">
                      {analysis.description}
                    </p>
                  </div>

                  {analysis.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-blue-700">
                        Detected Tags:
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-fill indicator */}
              {analysis.confidence >= 0.7 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      High confidence detected! This category would be
                      auto-filled in the issue form.
                    </span>
                  </div>
                </div>
              )}

              {analysis.confidence < 0.7 && analysis.confidence >= 0.4 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Medium confidence. Please review the suggested category.
                    </span>
                  </div>
                </div>
              )}

              {analysis.confidence < 0.4 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Low confidence. Please manually select the appropriate
                      category.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              How to get your Gemini API Key:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Go to{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy the generated API key</li>
              <li>
                Add it to your{" "}
                <code className="bg-gray-200 px-1 rounded">.env.local</code>{" "}
                file as{" "}
                <code className="bg-gray-200 px-1 rounded">
                  GEMINI_API_KEY=your_key_here
                </code>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTestComponent;

