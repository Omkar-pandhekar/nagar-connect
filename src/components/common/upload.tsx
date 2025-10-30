"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

const UploadExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState<
    { url: string; id: string; originalName: string }[]
  >([]);

  const handleUploadComplete = (
    files: { url: string; id: string; originalName: string }[]
  ) => {
    setUploadedFiles(files);
    console.log("Uploaded files:", files);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">File Upload with Cloudinary</h2>

      <FileUpload
        onUploadComplete={handleUploadComplete}
        maxFiles={3}
        acceptedFileTypes={{
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          "application/pdf": [".pdf"],
        }}
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Uploaded Files:</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  File {index + 1}: {file.originalName}
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ID: {file.id}</p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all text-sm"
                  >
                    {file.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExample;
