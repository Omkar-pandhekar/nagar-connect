import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconCheck, IconX, IconLoader } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface UploadedFile {
  file: File;
  url?: string;
  id?: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export const FileUpload = ({
  onChange,
  onUploadComplete,
  onImageAnalyzed,
  maxFiles = 5,
  acceptedFileTypes = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".doc", ".docx"],
  },
}: {
  onChange?: (files: File[]) => void;
  onUploadComplete?: (
    files: { url: string; id: string; originalName: string }[]
  ) => void;
  onImageAnalyzed?: (analysis: { category: string; confidence: number; description: string; tags: string[] }) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToServer = async (
    file: File
  ): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.file.url,
      id: data.file.id,
    };
  };

  const analyzeImage = async (imageUrl: string): Promise<void> => {
    if (!onImageAnalyzed) return;

    try {
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        onImageAnalyzed(data.analysis);
      }
    } catch (error) {
      console.error("Image analysis failed:", error);
    }
  };

  const handleFileChange = async (newFiles: File[]) => {
    if (uploadedFiles.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newUploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      status: "pending" as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
    onChange && onChange(newFiles);

    // Collect successfully uploaded files locally to avoid stale state issues
    const successfulFilesLocal: { url: string; id: string; originalName: string }[] = [];

    // Upload files to Cloudinary
    for (let i = 0; i < newUploadedFiles.length; i++) {
      const fileIndex = uploadedFiles.length + i;

      setUploadedFiles((prev) =>
        prev.map((item, index) =>
          index === fileIndex ? { ...item, status: "uploading" as const } : item
        )
      );

      try {
        const { url, id } = await uploadToServer(newFiles[i]);
        setUploadedFiles((prev) =>
          prev.map((item, index) =>
            index === fileIndex
              ? { ...item, status: "success" as const, url, id }
              : item
          )
        );

        // Analyze image if it's an image file
        if (newFiles[i].type.startsWith('image/')) {
          analyzeImage(url);
        }

        // Add to local successful list
        successfulFilesLocal.push({ url, id, originalName: newFiles[i].name });
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((item, index) =>
            index === fileIndex
              ? {
                  ...item,
                  status: "error" as const,
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : item
          )
        );
      }
    }

    // Call onUploadComplete with the newly successful files
    if (successfulFilesLocal.length > 0) {
      onUploadComplete && onUploadComplete(successfulFilesLocal);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    accept: acceptedFileTypes,
    maxFiles: maxFiles,
    onDrop: handleFileChange,
    onDropRejected: (errors) => {
      console.log("Drop rejected:", errors);
      errors.forEach((error) => {
        if (error.errors[0]?.code === "too-many-files") {
          alert(`Maximum ${maxFiles} files allowed`);
        } else {
          alert(`File rejected: ${error.errors[0]?.message}`);
        }
      });
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          accept={Object.keys(acceptedFileTypes).join(",")}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload file
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {uploadedFiles.length > 0 &&
              uploadedFiles.map((uploadedFile, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                    "shadow-sm",
                    uploadedFile.status === "error" &&
                      "border border-red-200 bg-red-50",
                    uploadedFile.status === "success" &&
                      "border border-green-200 bg-green-50"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {uploadedFile.file.name}
                    </motion.p>
                    <div className="flex items-center gap-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                      >
                        {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>

                      {/* Status Icon */}
                      {uploadedFile.status === "uploading" && (
                        <IconLoader className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                      {uploadedFile.status === "success" && (
                        <IconCheck className="h-4 w-4 text-green-500" />
                      )}
                      {uploadedFile.status === "error" && (
                        <IconX className="h-4 w-4 text-red-500" />
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(idx)}
                        className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <IconX className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {uploadedFile.file.type}
                    </motion.p>

                    <div className="flex items-center gap-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                      >
                        modified{" "}
                        {new Date(
                          uploadedFile.file.lastModified
                        ).toLocaleDateString()}
                      </motion.p>

                      {/* Status Text */}
                      {uploadedFile.status === "uploading" && (
                        <span className="text-blue-500 text-xs">
                          Uploading...
                        </span>
                      )}
                      {uploadedFile.status === "success" && (
                        <span className="text-green-500 text-xs">Uploaded</span>
                      )}
                      {uploadedFile.status === "error" && (
                        <span className="text-red-500 text-xs">
                          {uploadedFile.error || "Upload failed"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            {!uploadedFiles.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!uploadedFiles.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
